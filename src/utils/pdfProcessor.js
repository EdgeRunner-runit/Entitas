import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_CHARS = 30000;

export async function extractPdfText(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
  const totalPages = pdf.numPages;
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) {
      onProgress({ phase: "extracting", current: i, total: totalPages });
    }

    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = reconstructPageText(textContent.items);
    if (pageText.trim()) {
      pages.push({ pageNumber: i, text: pageText.trim() });
    }
  }

  return { pages, totalPages, filename: file.name };
}

function reconstructPageText(items) {
  if (!items || items.length === 0) return "";

  const lines = [];
  let currentLine = "";
  let lastY = null;
  let lastEndX = null;

  for (const item of items) {
    if (!item.str && item.str !== "") continue;

    const y = item.transform ? item.transform[5] : null;
    const x = item.transform ? item.transform[4] : null;

    if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = item.str;
    } else {
      const gap = (lastEndX !== null && x !== null) ? x - lastEndX : 0;
      if (gap > 10) {
        currentLine += "  " + item.str;
      } else if (gap > 2) {
        currentLine += " " + item.str;
      } else {
        currentLine += item.str;
      }
    }

    lastY = y;
    if (item.transform && item.width) {
      lastEndX = x + item.width;
    } else {
      lastEndX = null;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return mergeLines(lines);
}

function mergeLines(lines) {
  const blocks = [];
  let currentBlock = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : null;

    const isShort = line.length < 50;
    const isUpper = line === line.toUpperCase() && line.length > 2;
    const prevShort = prevLine && prevLine.length < 50;
    const looksLikeHeading = isShort && (isUpper || /^(chapter|section|part)\s/i.test(line));

    if (looksLikeHeading && currentBlock.length > 0) {
      blocks.push(currentBlock.join(" "));
      currentBlock = [line];
    } else if (line === "" || (prevShort && isShort && currentBlock.length > 0)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join(" "));
        currentBlock = [];
      }
      if (line) currentBlock.push(line);
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join(" "));
  }

  return blocks.join("\n\n");
}

export function extractPlainText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the text file"));
    reader.readAsText(file);
  });
}

export function buildPersonalityProfile(rawText, filename) {
  const cleanName = filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");

  let trimmedText = rawText;
  if (rawText.length > MAX_CHARS) {
    const head = rawText.slice(0, Math.floor(MAX_CHARS * 0.7));
    const tail = rawText.slice(-Math.floor(MAX_CHARS * 0.3));
    trimmedText = head + "\n\n[...content truncated for length...]\n\n" + tail;
  }

  const quotes = extractQuotes(rawText);
  const keyPhrases = extractKeyPhrases(rawText);

  let profileBlock = "";

  if (quotes.length > 0) {
    profileBlock += "\n\nNotable quotes found in the document:\n";
    profileBlock += quotes.slice(0, 15).map((q) => `- "${q}"`).join("\n");
  }

  if (keyPhrases.length > 0) {
    profileBlock += "\n\nRecurring themes and key phrases:\n";
    profileBlock += keyPhrases.slice(0, 20).map((p) => `- ${p}`).join("\n");
  }

  return {
    characterName: cleanName,
    documentText: trimmedText,
    profileBlock,
    stats: {
      totalChars: rawText.length,
      wasTruncated: rawText.length > MAX_CHARS,
      quotesFound: quotes.length,
      keyPhrasesFound: keyPhrases.length,
    },
  };
}

function extractQuotes(text) {
  const patterns = [
    /[""\u201C]([^""\u201D]{15,200})[""\u201D]/g,
    /[''\u2018]([^''\u2019]{15,200})[''\u2019]/g,
  ];

  const quotes = new Set();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const q = match[1].trim();
      if (q.split(" ").length >= 4 && !q.includes("http") && !/^\d/.test(q)) {
        quotes.add(q);
      }
    }
    if (quotes.size >= 15) break;
  }

  return [...quotes];
}

function extractKeyPhrases(text) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  const stopWords = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get",
    "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these",
    "give", "day", "most", "us", "was", "were", "been", "had", "has",
    "did", "are", "is", "am", "being", "does", "done", "much", "very",
    "said", "each", "may", "such", "more", "own", "many", "made",
  ]);

  const bigramCount = {};
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    if (
      w1.length > 3 &&
      w2.length > 3 &&
      !stopWords.has(w1) &&
      !stopWords.has(w2)
    ) {
      const bigram = `${w1} ${w2}`;
      bigramCount[bigram] = (bigramCount[bigram] || 0) + 1;
    }
  }

  return Object.entries(bigramCount)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([phrase, count]) => `${phrase} (×${count})`);
}

export function buildSystemPrompt(profile) {
  return `You are a personality simulator. You have been provided with a document that encodes information about a personality, character, or person named "${profile.characterName}". Fully adopt this personality based on the document content below.

CORE DIRECTIVES:
- Respond as this person would — using their tone, speech patterns, vocabulary, beliefs, values, and knowledge boundaries as revealed in the document.
- Stay fully in character at all times. Never break character.
- Never reference that you are an AI, a language model, or that you are reading a document.
- Draw upon the personality traits, opinions, emotional patterns, and communication style evident in the text.
- If the document contains direct quotes, adopt the linguistic style and vocabulary demonstrated in those quotes.
- If asked about something not covered in the document, respond as this person plausibly would based on their established personality traits.
${profile.profileBlock}

DOCUMENT CONTENT:
${profile.documentText}`;
}

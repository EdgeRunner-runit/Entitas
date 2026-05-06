const DEFAULT_API_KEY = "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";

export { DEFAULT_API_KEY };

function detectProvider(apiKey) {
  if (!apiKey) return "nvidia";
  if (apiKey.startsWith("AIza")) return "gemini";
  if (apiKey.startsWith("nvapi-")) return "nvidia";
  if (apiKey.startsWith("sk-")) return "nvidia";
  return "nvidia";
}

async function sendViaNvidia(messages, apiKey) {
  const response = await fetch("/api/nvidia/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || errorData.detail || `NVIDIA API request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No response content received from the model");
  }
  return content;
}

async function sendViaGemini(messages, apiKey) {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = { contents };

  if (systemMsg) {
    body.systemInstruction = {
      parts: [{ text: systemMsg.content }],
    };
  }

  body.generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 1024,
  };

  const response = await fetch(`/api/gemini/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gemini API request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("No response content received from Gemini");
  }
  return content;
}

export async function sendMessage(messages, apiKey) {
  const key = apiKey || DEFAULT_API_KEY;
  const provider = detectProvider(key);

  if (provider === "gemini") {
    return sendViaGemini(messages, key);
  }
  return sendViaNvidia(messages, key);
}

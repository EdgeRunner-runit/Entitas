const DEFAULT_API_KEY = "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";
const BASE_URL = "/api/nvidia";
const MODEL = "meta/llama-3.3-70b-instruct";

export { DEFAULT_API_KEY };

export async function sendMessage(messages, apiKey) {
  const key = apiKey || DEFAULT_API_KEY;
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || errorData.detail || `API request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No response content received from the model");
  }
  return content;
}

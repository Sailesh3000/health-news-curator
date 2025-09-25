import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: import.meta.env.VITE_HF_TOKEN,
  dangerouslyAllowBrowser: true, // <-- Add this line for testing only
});

// Summarization Service
export async function llamaSummarize(text) {
  const chatCompletion = await client.chat.completions.create({
    model: "meta-llama/Llama-3-8B-Instruct",
    messages: [
      {
        role: "user",
        content: `Summarize this article in 2 lines (TL;DR) and give 3 key takeaways:\n\n${text}`,
      },
    ],
  });
  return chatCompletion.choices[0].message.content;
}

export async function getSummary(article) {
  const summary = await llamaSummarize(
    article.description || article.content || article.title
  );
  return summary;
}

// Friendly Rewrite Service
export async function rewriteArticleFriendly(text) {
  const prompt = `
Rewrite the following news article in a simple, friendly, and conversational tone.
Make it easy to understand for everyone, using relatable analogies and clear language.

Article:
${text}
`;

  const response = await client.chat.completions.create({
    model: "meta-llama/Llama-3-8B-Instruct",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices?.[0]?.message?.content;
}
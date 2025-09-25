import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(import.meta.env.VITE_HF_TOKEN);

// Summarization Service
export async function llamaSummarize(text) {
  const chatCompletion = await client.chatCompletion({
    provider: "auto",
    model: "meta-llama/Llama-3.2-1B-Instruct",
    messages: [
      {
        role: "user",
        content: `Summarize this article in 2 lines (TL;DR) and give 3 key takeaways:\n\n${text}`,
      },
    ],
  });
  // Return the string content, not the whole message object
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

  const response = await client.chatCompletion({
    provider: "auto",
    model: "meta-llama/Llama-3.2-1B-Instruct",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices?.[0]?.message;
}
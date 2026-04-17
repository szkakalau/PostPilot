const API = "https://api.deepseek.com/v1/chat/completions";

export async function generateSocialPosts(userPrompt: string): Promise<string[]> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a social media copywriter. Output exactly numbered or line-separated short posts. Use newlines between posts.",
        },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`DeepSeek error: ${res.status} ${t}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\d+[\).\s]+/, "").trim())
    .filter(Boolean);
  return lines.length ? lines : [text];
}

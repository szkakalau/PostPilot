const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendMagicLinkEmail(to: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "PostPilot <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY not set; magic link (dev):\n", link);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your PostPilot login link",
      html: `<p>Click to sign in:</p><p><a href="${link}">${link}</a></p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${res.status} ${text}`);
  }
}

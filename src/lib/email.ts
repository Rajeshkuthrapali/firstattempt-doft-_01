/**
 * Email Provider Abstraction (P4)
 *
 * Wraps transactional email dispatch behind a provider-agnostic interface.
 * Supports Resend and SendGrid; falls back to console logging in dev.
 *
 * Configuration:
 *   VITE_EMAIL_PROVIDER = "resend" | "sendgrid" | undefined
 *   VITE_EMAIL_API_KEY  = provider API key
 *   VITE_EMAIL_FROM     = sender address (e.g. hello@lumiere.co)
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  tags?: string[];
}

type EmailProvider = "resend" | "sendgrid" | "console";

const provider: EmailProvider =
  (import.meta.env.VITE_EMAIL_PROVIDER as EmailProvider) || "console";
const apiKey = import.meta.env.VITE_EMAIL_API_KEY as string | undefined;
const fromAddress = import.meta.env.VITE_EMAIL_FROM || "hello@lumiere.co";

/**
 * Sends a transactional email using the configured provider.
 * In development (no provider configured), logs to console.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  switch (provider) {
    case "resend":
      return sendViaResend(payload);
    case "sendgrid":
      return sendViaSendGrid(payload);
    default:
      console.log("[Email:Console]", payload.subject, "→", payload.to);
      console.log("[Email:Console] Body preview:", payload.html.slice(0, 200));
      return true;
  }
}

async function sendViaResend(payload: EmailPayload): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        tags: payload.tags?.map((t) => ({ name: t, value: "true" })),
      }),
    });
    if (!res.ok) throw new Error(`Resend API ${res.status}`);
    console.log("[Email:Resend] Sent:", payload.subject);
    return true;
  } catch (err) {
    console.error("[Email:Resend] Failed:", err);
    return false;
  }
}

async function sendViaSendGrid(payload: EmailPayload): Promise<boolean> {
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: fromAddress },
        subject: payload.subject,
        content: [{ type: "text/html", value: payload.html }],
      }),
    });
    if (!res.ok) throw new Error(`SendGrid API ${res.status}`);
    console.log("[Email:SendGrid] Sent:", payload.subject);
    return true;
  } catch (err) {
    console.error("[Email:SendGrid] Failed:", err);
    return false;
  }
}

// ── Prebuilt email templates ──

/** Generates HTML for abandoned cart recovery email. */
export function abandonedCartTemplate(
  customerName: string,
  items: { name: string; price: number }[],
): string {
  const itemList = items
    .map((i) => `<li>${i.name} — ₹${i.price.toLocaleString()}</li>`)
    .join("");
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px;">
      <h1 style="color: #2d2926;">You left something beautiful behind</h1>
      <p style="color: #6b5e54;">Hi ${customerName}, these items are still waiting for you:</p>
      <ul style="color: #2d2926;">${itemList}</ul>
      <a href="https://lumiere.co/checkout" style="display:inline-block; background:#2d2926; color:white; padding:12px 24px; text-decoration:none; margin-top:20px;">
        Complete Your Order
      </a>
    </div>
  `;
}

/** Generates HTML for loyalty tier unlock email. */
export function loyaltyUnlockTemplate(customerName: string, newTier: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px;">
      <h1 style="color: #2d2926;">Congratulations, ${customerName}! 🎉</h1>
      <p style="color: #6b5e54;">You've unlocked the <strong>${newTier}</strong> tier in our loyalty program.</p>
      <p style="color: #6b5e54;">Enjoy exclusive benefits, early access to new collections, and special rewards.</p>
      <a href="https://lumiere.co/account/loyalty" style="display:inline-block; background:#c4a093; color:white; padding:12px 24px; text-decoration:none; margin-top:20px;">
        View Your Rewards
      </a>
    </div>
  `;
}

/** Generates HTML for scent-match quiz recommendation email. */
export function quizRecommendationTemplate(
  customerName: string,
  profile: string,
  recommendations: { name: string; slug: string }[],
): string {
  const recList = recommendations
    .map((r) => `<li><a href="https://lumiere.co/product/${r.slug}">${r.name}</a></li>`)
    .join("");
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px;">
      <h1 style="color: #2d2926;">Your ${profile} Scent Profile</h1>
      <p style="color: #6b5e54;">Hi ${customerName}, based on your quiz results, here are our top picks for you:</p>
      <ul style="color: #2d2926;">${recList}</ul>
      <a href="https://lumiere.co/collections?scent=${profile.toLowerCase()}" style="display:inline-block; background:#2d2926; color:white; padding:12px 24px; text-decoration:none; margin-top:20px;">
        Browse Your Collection
      </a>
    </div>
  `;
}

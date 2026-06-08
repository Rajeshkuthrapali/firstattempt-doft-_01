// ---------------------------------------------------------------------------
// Server-side transactional email service
//
// Uses server environment variables (RESEND_API_KEY / SENDGRID_API_KEY) to
// send emails — no frontend API keys involved.
// ---------------------------------------------------------------------------

import { env } from "../config/env.js";

type EmailProvider = "resend" | "sendgrid" | "console";

function getProvider(): EmailProvider {
  if (env.RESEND_API_KEY) return "resend";
  if (env.SENDGRID_API_KEY) return "sendgrid";
  return "console";
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  tags?: string[],
): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        tags: tags?.map((t) => ({ name: t, value: "true" })),
      }),
    });
    if (!res.ok) throw new Error(`Resend API ${res.status}`);
    console.log("[Email:Resend] Sent:", subject, "→", to);
    return true;
  } catch (err) {
    console.error("[Email:Resend] Failed:", err);
    return false;
  }
}

async function sendViaSendGrid(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: env.EMAIL_FROM },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });
    if (!res.ok) throw new Error(`SendGrid API ${res.status}`);
    console.log("[Email:SendGrid] Sent:", subject, "→", to);
    return true;
  } catch (err) {
    console.error("[Email:SendGrid] Failed:", err);
    return false;
  }
}

/**
 * Low-level send function — picks the best available provider.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  tags?: string[],
): Promise<boolean> {
  const provider = getProvider();

  switch (provider) {
    case "resend":
      return sendViaResend(to, subject, html, tags);
    case "sendgrid":
      return sendViaSendGrid(to, subject, html);
    default:
      console.log("[Email:Console]", subject, "→", to);
      console.log("[Email:Console] Body preview:", html.slice(0, 200));
      return true;
  }
}

// ---------------------------------------------------------------------------
// High-level transactional email builders
// ---------------------------------------------------------------------------

/** Sends an order confirmation email to the customer. */
export async function sendOrderConfirmation(
  orderId: string,
  email: string,
  items: Array<{ name: string; quantity: number; priceCents: number }>,
  totalCents: number,
): Promise<boolean> {
  const itemList = items
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td>× ${i.quantity}</td><td>₹${(i.priceCents / 100).toFixed(2)}</td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px;">
      <h1 style="color: #2d2926;">Thank you for your order!</h1>
      <p style="color: #6b5e54;">Your order <strong>#${orderId.slice(0, 8)}</strong> has been confirmed.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #e8e0d8;">
            <th style="text-align: left; padding: 8px;">Item</th>
            <th style="text-align: center; padding: 8px;">Qty</th>
            <th style="text-align: right; padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemList}
        </tbody>
      </table>
      <p style="font-size: 1.2em; color: #2d2926;">
        <strong>Total: ₹${(totalCents / 100).toFixed(2)}</strong>
      </p>
      <a href="https://lumiere.co/account/orders/${orderId}" 
         style="display:inline-block; background:#2d2926; color:white; padding:12px 24px; text-decoration:none; margin-top:20px;">
        View Order
      </a>
    </div>
  `;

  return sendEmail(email, `Order Confirmed — #${orderId.slice(0, 8)}`, html, [
    "order-confirmation",
  ]);
}

/** Sends a password reset email with a reset link. */
export async function sendPasswordReset(
  email: string,
  resetToken: string,
): Promise<boolean> {
  const resetUrl = `https://lumiere.co/auth/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px;">
      <h1 style="color: #2d2926;">Reset your password</h1>
      <p style="color: #6b5e54;">Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" 
         style="display:inline-block; background:#2d2926; color:white; padding:12px 24px; text-decoration:none; margin-top:20px;">
        Reset Password
      </a>
      <p style="color: #6b5e54; margin-top: 20px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail(email, "Reset your Lumiere password", html, [
    "password-reset",
  ]);
}

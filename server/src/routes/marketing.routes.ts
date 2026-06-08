import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const trackEventSchema = z.object({
  event: z.string().min(1),
  email: z.string().email(),
  properties: z.record(z.unknown()).default({}),
});

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// POST /api/marketing/track
// Accepts marketing events from the frontend and forwards to the configured
// provider (Klaviyo or HubSpot) using server-side API keys.
// ---------------------------------------------------------------------------

async function sendToKlaviyo(
  event: string,
  email: string,
  properties: Record<string, unknown>,
): Promise<boolean> {
  if (!env.KLAVIYO_API_KEY) {
    console.log("[Marketing] Klaviyo not configured — event skipped");
    return false;
  }

  try {
    const res = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
        revision: "2024-02-15",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: { data: { type: "metric", attributes: { name: event } } },
            profile: { data: { type: "profile", attributes: { email } } },
            properties,
            time: new Date().toISOString(),
          },
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[Marketing:Klaviyo] Event failed:", err);
    return false;
  }
}

async function sendToHubSpot(
  event: string,
  email: string,
  properties: Record<string, unknown>,
): Promise<boolean> {
  if (!env.HUBSPOT_API_KEY) {
    console.log("[Marketing] HubSpot not configured — event skipped");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.hubapi.com/events/v3/send?hapikey=${env.HUBSPOT_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: `pe_lumiere_${event}`,
          email,
          properties,
          occurredAt: new Date().toISOString(),
        }),
      },
    );
    return res.ok;
  } catch (err) {
    console.error("[Marketing:HubSpot] Event failed:", err);
    return false;
  }
}

router.post("/track", async (req: Request, res: Response): Promise<void> => {
  try {
    const body = trackEventSchema.parse(req.body);
    const provider =
      (req.headers["x-marketing-provider"] as string) || "klaviyo";

    let ok: boolean;
    if (provider === "hubspot") {
      ok = await sendToHubSpot(body.event, body.email, body.properties);
    } else {
      ok = await sendToKlaviyo(body.event, body.email, body.properties);
    }

    res.json({ success: true, delivered: ok });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0].message });
      return;
    }
    console.error("[Marketing] Track error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/marketing/send-email
// Forwards transactional email requests to the configured provider (Resend or
// SendGrid) using server-side API keys.
// ---------------------------------------------------------------------------

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  tags?: string[],
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log("[Email] Resend not configured — email skipped");
    return false;
  }

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
  if (!env.SENDGRID_API_KEY) {
    console.log("[Email] SendGrid not configured — email skipped");
    return false;
  }

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

router.post("/send-email", async (req: Request, res: Response): Promise<void> => {
  try {
    const body = sendEmailSchema.parse(req.body);
    const provider =
      (req.headers["x-email-provider"] as string) || "resend";

    let ok: boolean;
    if (provider === "sendgrid") {
      ok = await sendViaSendGrid(body.to, body.subject, body.html);
    } else {
      ok = await sendViaResend(body.to, body.subject, body.html, body.tags);
    }

    res.json({ success: true, delivered: ok });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0].message });
      return;
    }
    console.error("[Email] Send error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

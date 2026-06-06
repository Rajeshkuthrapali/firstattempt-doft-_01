import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!email || !email.includes("@"))
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 },
    );
  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const MAILCHIMP_DC = MAILCHIMP_API_KEY?.split("-").pop();
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
    return NextResponse.json({
      success: true,
      message:
        "Thank you! Please check your email to confirm your subscription.",
    });
  }
  try {
    const response = await fetch(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "pending",
          tags: ["website-signup"],
        }),
      },
    );
    const data = await response.json();
    if (response.ok)
      return NextResponse.json({
        success: true,
        message:
          "Thank you! Please check your email to confirm your subscription.",
      });
    if (data.title === "Member Exists")
      return NextResponse.json({
        success: true,
        message: "You're already subscribed! Thank you.",
      });
    return NextResponse.json(
      { error: data.detail ?? "Subscription failed" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 },
    );
  }
}

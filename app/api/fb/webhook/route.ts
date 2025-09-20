import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { handleFacebookWebhook } from "@/services/fbWebhookService";

/**
 * Facebook Webhook Verification (GET)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log("🔎 FB Webhook Verification Request:", {
    mode,
    token,
    expected: process.env.FB_VERIFY_TOKEN,
    challenge,
  });

  if (mode === "subscribe" && token === process.env.FB_VERIFY_TOKEN) {
    // Must echo back the challenge EXACTLY
    return new NextResponse(challenge || "ok", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Facebook Webhook Message Handler (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 FB Webhook Event:", JSON.stringify(body, null, 2));

    if (!body?.entry?.length) {
      return NextResponse.json({ ok: true });
    }

    await connectDB();
    await handleFacebookWebhook(body);

    // Respond fast so FB doesn't retry
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("❌ FB Webhook POST error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

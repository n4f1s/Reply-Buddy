import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { handleFacebookWebhook, FBWebhookEvent } from "@/services/fbWebhookService";

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
    console.log("✅ Webhook verified successfully.");
    return new NextResponse(challenge || "ok", { status: 200 });
  }

  console.warn("⚠️ Webhook verification failed:", { mode, token });
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Facebook Webhook Message Handler (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body: FBWebhookEvent = await req.json();
    console.log("📩 Incoming FB Webhook Event:", JSON.stringify(body, null, 2));

    if (!body?.entry?.length) {
      console.warn("⚠️ No entry in FB webhook payload");
      return NextResponse.json({ ok: true });
    }

    console.log("🔗 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected.");

    console.log("➡️ Passing event to fbWebhookService...");
    await handleFacebookWebhook(body);

    console.log("✅ Webhook event handled successfully.");
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("❌ FB Webhook POST error:", (err as Error).message || err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

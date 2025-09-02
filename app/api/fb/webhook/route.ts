import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

/**
 * Facebook Webhook Verification (GET)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.FB_VERIFY_TOKEN) {
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
    if (!body?.entry?.length) {
      return NextResponse.json({ ok: true });
    }

    await connectDB();

    for (const entry of body.entry) {
      const pageId = entry.id;
      const messagingEvents = entry.messaging || [];
      if (!messagingEvents.length) continue;

      for (const m of messagingEvents) {
        const senderId = m.sender?.id;
        if (!senderId) continue;

        const text =
          m.message?.text ||
          (m.message && JSON.stringify(m.message));

        // find or create shop
        let shop = await Shop.findOne({ fbPageId: pageId });
        if (!shop) {
          shop = await Shop.create({
            fbPageId: pageId,
            name: `FB Shop ${pageId}`,
          });
        }

        // find or create conversation
        let conversation = await Conversation.findOne({
          shopId: shop._id,
          userId: senderId,
          channel: "facebook",
        });
        if (!conversation) {
          conversation = await Conversation.create({
            shopId: shop._id,
            userId: senderId,
            channel: "facebook",
          });
        } else {
          conversation.lastActive = new Date();
          await conversation.save();
        }

        // create message
        if (text) {
          await Message.create({
            conversationId: conversation._id,
            role: "user",
            text: typeof text === "string" ? text : JSON.stringify(text),
            raw: m,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("FB Webhook POST error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

// app/api/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const shops = await Shop.find().limit(10).lean();
    const conv = await Conversation.find().sort({ updatedAt: -1 }).limit(5).lean();
    const msgs = await Message.find().sort({ createdAt: -1 }).limit(10).lean();

    return NextResponse.json({ shops, conv, msgs });
  } catch (err) {
    return NextResponse.json({ error: "DB error", details: err });
  }
}

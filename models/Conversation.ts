// models/Conversation.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConversation extends Document {
  shopId: mongoose.Types.ObjectId;
  channel: "facebook" | "whatsapp";
  userId: string;
  lastActive?: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    channel: { type: String, enum: ["facebook", "whatsapp"], required: true },
    userId: { type: String, required: true, index: true },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);
export default Conversation;

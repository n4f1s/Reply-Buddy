import mongoose, { Document, Model, Schema } from 'mongoose'

export type Role = 'user' | 'bot' | 'agent'

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  role: Role
  text: string
  raw?: any
  language?: string
  mid?: string
  createdAt?: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    role: { type: String, enum: ['user', 'bot', 'agent'], required: true },
    text: { type: String, required: true },
    raw: { type: Schema.Types.Mixed },
    language: { type: String },
    mid: { type: String, unique: true, sparse: true }, // prevent duplicates messages being saved
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)
export default Message

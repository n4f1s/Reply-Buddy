import Shop from '@/models/Shop';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { generateAIReply } from './aiService';
import { sendFacebookMessage, sendTypingIndicator } from './fbSendService';

export async function handleFacebookWebhook(body: any) {
  for (const entry of body.entry) {
    const pageId = entry.id;
    const messagingEvents = entry.messaging || [];
    if (!messagingEvents.length) continue;

    for (const m of messagingEvents) {
      const senderId = m.sender?.id;
      const mid = m.message?.mid || m.id;
      if (!senderId || !mid) continue;

      // Skip duplicate FB messages
      const exists = await Message.findOne({ mid });
      if (exists) continue;

      const text = m.message?.text || (m.message && JSON.stringify(m.message));
      if (!text) continue;

      // Find or create shop
      let shop = await Shop.findOne({ fbPageId: pageId });
      if (!shop) {
        shop = await Shop.create({
          fbPageId: pageId,
          name: `FB Shop ${pageId}`,
        });
      }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        shopId: shop._id,
        userId: senderId,
        channel: 'facebook',
      });
      if (!conversation) {
        conversation = await Conversation.create({
          shopId: shop._id,
          userId: senderId,
          channel: 'facebook',
        });
      } else {
        conversation.lastActive = new Date();
        await conversation.save();
      }

      // Save user message
      await Message.create({
        conversationId: conversation._id,
        role: 'user',
        text: typeof text === 'string' ? text : JSON.stringify(text),
        raw: m,
        mid,
      });

      // Typing indicator
      const pageToken = shop.pageAccessToken || process.env.PAGE_ACCESS_TOKEN!;
      await sendTypingIndicator(pageToken, senderId);

      // Random delay to simulate typing
      // await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

      // Check if AI already replied to this message
      const alreadyReplied = await Message.findOne({
        conversationId: conversation._id,
        role: 'bot',
        replyToMid: mid,
      });

      if (!alreadyReplied) {
        const reply = await generateAIReply(shop._id.toString(), text);

        // Save AI reply
        await Message.create({
          conversationId: conversation._id,
          role: 'bot',
          text: reply,
          raw: {},
          replyToMid: mid, // Proper reference to user message
        });

        // Send AI reply to Facebook
        await sendFacebookMessage(pageToken, senderId, reply);
      }
    }
  }
}

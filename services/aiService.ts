import { GoogleGenerativeAI } from '@google/generative-ai'
import { getShopData } from './shopService'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function generateAIReply (shopId: string, userMessage: string) {
  try {
    const shopData = await getShopData(shopId)

    // Build a system prompt including shop info
    const systemPrompt = `
      You are a polite assistant for this shop.
      Shop Name: ${shopData.name}
      Products: ${JSON.stringify(shopData.products)}
      Delivery Cost: ${shopData.deliveryCost}
      Delivery Time: ${shopData.deliveryTime}

      Detect script/language: 
        - If message contains Bengali Unicode → reply in Bangla. 
        - If message contains English alphabet only → reply in English. 
        - If message is Romanized Bangla (English alphabet but patterns of Bangla words) → reply in Bangla script.

      Reply concisely and politely to the user message below.
    `

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(
      `${systemPrompt}\nUser: ${userMessage}`
    )

    return result.response.text() || 'Sorry, I could not generate a reply.'
  } catch (err) {
    console.error('AI reply error:', err)
    return 'Sorry, I could not generate a reply.'
  }
}

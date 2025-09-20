const FB_GRAPH_URL = "https://graph.facebook.com/v17.0";

export async function sendFacebookMessage(pageAccessToken: string, recipientId: string, text: string) {
  const url = `${FB_GRAPH_URL}/me/messages?access_token=${pageAccessToken}`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });
}

export async function sendTypingIndicator(pageAccessToken: string, recipientId: string) {
  const url = `${FB_GRAPH_URL}/me/messages?access_token=${pageAccessToken}`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      sender_action: "typing_on",
    }),
  });
}
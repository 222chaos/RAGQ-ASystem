import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export const config = {
  runtime: "edge",
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { messages } = await req.json();
      const chatMessages = messages.map((message) => ({
        role: "user",
        content: message.content,
      }));
      const userId = uuidv4();
      const rolePlayText = ` `;

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const chatData = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: rolePlayText },
                { role: "user", content: `UserId: ${userId}` },
                ...chatMessages,
              ],
              temperature: 1,
              max_tokens: 888,
              stream: true,
            });

            for await (const part of chatData) {
              controller.enqueue(
                encoder.encode(part.choices[0]?.delta?.content || "")
              );
            }
            // 完成后，关闭流
            controller.close();
          } catch (e) {
            // 如果在执行过程中发生错误，向流发送错误
            controller.error(e);
          }
        },
      });

      return new Response(stream);
    } catch (error) {
      const res = new Response(
        JSON.stringify({
          message: "Internal server error" + error.message,
        }),
        {
          status: 500,
        }
      );
      return res;
    }
  } else {
    const res = new Response({
      status: 405,
      statusText: "Method not allowed",
    });
    return res;
  }
}

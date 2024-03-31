import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  base: process.env.PROXY_URL,
});
console.log("process.env.PROXY_URL==", process.env.PROXY_URL);
export const config = {
  runtime: "edge",
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log("api");
    try {
      const { query } = await req.json();
      console.log(query);
      const userId = uuidv4();
      const rolePlayText = ` `;

      const encoder = new TextEncoder();
      const userMessages = query.map((message) => ({
        role: "user",
        content: message.content,
      }));

      const chatData = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: rolePlayText },
          { role: "user", content: `UserId: ${userId}` },
          ...userMessages,
        ],
        temperature: 1,
        max_tokens: 888,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const part of chatData) {
              controller.enqueue(
                encoder.encode(part.choices[0]?.delta?.content || "")
              );
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });

      return new Response(stream);
    } catch (error) {
      console.log("errorrrrrrr===", error);
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

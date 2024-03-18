import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

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
      console.log(messages);

      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query,
        encoding_format: "float",
      });
      const embeddingData = embedding.data[0].embedding;
      const userMessages = messages.map((message) => ({
        role: "user",
        content: message.content,
      }));

      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });
      const collectionName = "test_collection";
      const res1 = await client.search(collectionName, {
        vector: embeddingData,
        limit: 1,
      });
      let content = array[res1[0]?.id];

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const chatData = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "user",
                  content: `\n
      问题："""${query}"""
      可能的答案:"""${JSON.stringify(content)}"""
      \n
      基于以上的问题和可能的答案总结一个得体并且言简意骇的回答，只需要输出回答即可。
      例如：
        > 在.umijs.js中无法使用require.context，因为.umijs.js不是在浏览器环境下运行，而是通过node的fs进行处理。
                  `,
                },
              ],
              temperature: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
              max_tokens: 2000,
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
      console.log(error);
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

import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});
console.log("process.env.PROXY_URL==", process.env.PROXY_URL);
export const config = {
  runtime: "edge",
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { query, selectedImageInfo } = await req.json();
      let path = "";
      let selectedInfo = "";
      if (selectedImageInfo == "计算机网络") {
        path = "public/data/jsjwl.txt";
        selectedInfo = "jsjwl";
      }
      if (selectedImageInfo == "需求工程") {
        path = "public/data/xqgc.txt";
        selectedInfo = "xqgc";
      }
      if (selectedImageInfo == "操作系统") {
        path = "public/data/czxt.txt";
        selectedInfo = "czxt";
      }
      console.log(selectedImageInfo);
      console.log("query=========", query[0].content);

      const readFileResponse = await fetch(
        "http://localhost:3000/api/readFile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        }
      );
      const array = await readFileResponse.json();

      //const rolePlayText = ` `;

      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query[0].content,
        encoding_format: "float",
      });
      const embeddingData = embedding.data[0].embedding;

      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });
      const collectionName = selectedInfo;
      const res1 = await client.search(collectionName, {
        vector: embeddingData,
        limit: 1,
      });

      let content = array[res1[0]?.id];

      const encoder = new TextEncoder();
      const userMessages = query.map((query) => ({
        role: "user",
        content: query.content,
      }));

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

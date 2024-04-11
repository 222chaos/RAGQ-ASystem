import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});
console.log('process.env.PROXY_URL==', process.env.PROXY_URL);
export const config = {
  runtime: 'edge',
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { query, selectedImageInfo } = await req.json();

      let selectedInfo = '';
      if (selectedImageInfo == '计算机网络') {
        selectedInfo = 'jsjwl';
      }
      if (selectedImageInfo == '需求工程') {
        selectedInfo = 'xqgc';
      }
      if (selectedImageInfo == '操作系统') {
        selectedInfo = 'czxt';
      }

      const embedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query.at(-1).content,
        encoding_format: 'float',
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
      const contents = res1.map((item) => item.payload.content);

      console.log(selectedImageInfo);
      console.log('问题：', query.at(-1).content);

      console.log('可能的答案', contents);
      const encoder = new TextEncoder();
      const userMessages = query.map((query) => ({
        role: 'user',
        content: query.content,
      }));

      const chatData = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `\n
       问题：${query.at(-1).content}
       可能的答案:${JSON.stringify(contents)}
       \n
       基于以上的问题和可能的答案总结一个得体并且言简意骇的回答，只需要输出回答即可。
       例如：什么是需求工程？
        > 需求工程是指所有与需求相关的活动和过程，包括需求分析、需求管理、需求确认和需求变更控制等，其目的是确保软件系统或产品能够满足用户的期望和需求。
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
              console.log(part.choices[0]?.delta?.content);
              controller.enqueue(encoder.encode(part.choices[0]?.delta?.content || ''));
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });

      return new Response(stream);
    } catch (error) {
      console.log('errorrrrrrr===', error);
      const res = new Response(
        JSON.stringify({
          message: 'Internal server error' + error.message,
        }),
        {
          status: 500,
        },
      );
      return res;
    }
  } else {
    const res = new Response({
      status: 405,
      statusText: 'Method not allowed',
    });
    return res;
  }
}

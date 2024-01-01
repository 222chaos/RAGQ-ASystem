// pages/api/encode.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { item } = await req.body; // 修改此处来获取适当的数据

      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: item,
        encoding_format: "float",
      });
      const embeddingData = embedding.data[0].embedding;
      console.log(embeddingData);
      res.status(200).json({ embeddingData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

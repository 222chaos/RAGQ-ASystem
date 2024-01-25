import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { content } = req.body;

    console.log("content======>", content);
    // 分隔文本，每150个字为一段
    const chunkSize = 150;
    const textChunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      textChunks.push(content.substring(i, i + chunkSize));
    }
    try {
      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });

      const prepareData = async () => {
        const collectionName = "test_collection";

        // 获取已存在的集合列表
        let result = await client.getCollections();

        // 提取集合名称
        const collectionNames = result.collections.map(
          (collection) => collection.name
        );

        // 如果集合已存在，则删除它
        if (collectionNames.includes(collectionName)) {
          await client.deleteCollection(collectionName);
        }

        // 创建新的集合
        await client.createCollection(collectionName, {
          vectors: {
            size: 1536,
            distance: "Euclid",
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 2,
        });

        result = await client.getCollections();

        console.log("集合列表:", result.collections);

        let index = 0;
        const points = [];
        for await (const item of textChunks) {
          console.log("###############");

          console.log(index, " /////", item);
          const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: item,
            encoding_format: "float",
          });
          const embeddingData = embedding.data[0].embedding;
          points.push({
            id: index,
            vector: embeddingData,
            payload: {
              text: ["test"],
            },
          });
          index++;

          await client.upsert(collectionName, {
            points: points,
          });
        }
      };

      await prepareData();

      res.status(200).json({ data: textChunks });
    } catch (error) {
      console.error("Error:", error.message, "123123");
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ status: "Method not allowed" });
  }
}

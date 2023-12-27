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
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: "1",
        encoding_format: "float",
      });

      const embeddingData = embedding.data[0].embedding;
      console.log(embeddingData);
      const points = [
        {
          id: 1,
          vector: embeddingData,
          payload: { text: ["test"] },
        },
      ];

      const client = new QdrantClient({
        url: "https://89a73577-ef68-4421-8152-63b793a81404.us-east4-0.gcp.cloud.qdrant.io:6333",
        apiKey: "k2W-EihfdVzApnM0IH4fvyqjRgxRSz8i4yjkkKrJsqOvRpGwsi5v-g",
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
        await client.upsert(collectionName, {
          points: points,
        });

        console.log("points: ", points);
      };

      // 调用准备数据的函数
      prepareData();

      const result = await client.getCollections();
      console.log("List of collections:", result.collections);
      const { query } = await req.json();

      console.log("Received query:", query);
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

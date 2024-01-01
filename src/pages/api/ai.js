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
      const { data } = await req.json(); // 从前端获取数据

      console.log("Received data:", data);

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
        for await (const item of data) {
          console.log("###############");
          console.log(item);

          // 调用新的 API 路由来进行编码
          const response = await fetch("http://localhost:3000/api/encode", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ item }), // 发送适当的数据给新的 API 路由
          });

          const { embeddingData } = await response.json();

          points.push({
            id: index,
            vector: embeddingData,
            payload: {
              text: ["test"],
            },
          });
          index++;
        }

        // 在所有 points.push 操作完成后调用 client.upsert
        await client.upsert(collectionName, {
          points: points,
        });
      };

      // 调用准备数据的函数
      await prepareData();

      res.status(200).json({ message: "Data processed successfully" });
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

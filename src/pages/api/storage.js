import { QdrantClient } from "@qdrant/js-client-rest";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const filePath = "src/pages/api/emjsjwl.txt";
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      console.log("content======>", content);

      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });

      const prepareData = async () => {
        const collectionName = "jsjwl";
        let result = await client.getCollections();
        const collectionNames = result.collections.map(
          (collection) => collection.name
        );

        if (collectionNames.includes(collectionName)) {
          await client.deleteCollection(collectionName);
        }

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
        for await (const item of content) {
          console.log("###############");

          console.log(index, " /////", item);

          points.push({
            id: index,
            vector: item,
            payload: {
              text: index,
            },
          });
          index++;

          await client.upsert(collectionName, {
            points: points,
          });
        }
      };

      await prepareData();
      console.log("Data uploaded successfully");
      res.status(200).json({ message: "Data uploaded successfully" });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ status: "Method not allowed" });
  }
}

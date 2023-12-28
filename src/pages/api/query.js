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
      const { data } = await req.json();
      console.log("Received data:", data);
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: data,
        encoding_format: "float",
      });
      const embeddingData = embedding.data[0].embedding;

      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });

      const queryDatabase = async () => {
        const collectionName = "test_collection";

        const result = await client.query({
          vector: embeddingData,
          collection_name: collectionName,
          top: 10,
        });

        console.log("Query results:", result);

        res.status(200).json({ message: "Query successful", result });
      };

      await queryDatabase();

      res.status(200).json({ message: "Data processed successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error" + error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

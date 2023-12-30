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
      const { query } = await req.json();
      console.log("Received data:", query);
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query,
        encoding_format: "float",
      });
      const embeddingData = embedding.data[0].embedding;

      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });
      const collectionName = "test_collection";
      const queryDatabase = async () => {
        const res1 = await client.search(collectionName, {
          vector: embeddingData,
          limit: 2,
        });

        console.log("search result: ", res1);

        res.status(200).json({ message: "Query successful", result });
      };

      await queryDatabase();

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

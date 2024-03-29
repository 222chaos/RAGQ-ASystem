import { QdrantClient } from "@qdrant/js-client-rest";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const filePath = "public/data/arrayxqgc.txt";
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      console.log("xq.len:", content.length);
      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });

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

import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const content = `你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    你好你好你好你好你好你好你好你好你好你好你好你好你好你好
    `;

    console.log("content======>", content);

    let textChunks = content.split("\n");

    // 合并内容，确保每个item长度不少于200字
    for (let i = 0; i < textChunks.length - 1; i++) {
      while ((textChunks[i] + textChunks[i + 1]).length < 200) {
        textChunks[i] += "\n" + textChunks[i + 1];
        textChunks.splice(i + 1, 1);
      }
    }

    let startIndex = 0;
    try {
      const startIndexFilePath = path.join(process.cwd(), "startIndex.txt");

      // 读取已经完成嵌入的序号
      if (fs.existsSync(startIndexFilePath)) {
        const startIndexContent = fs.readFileSync(startIndexFilePath, "utf-8");
        startIndex = parseInt(startIndexContent);
      }
    } catch (error) {
      console.error("Error reading startIndex:", error.message);
    }

    try {
      const embeddings = [];
      for (let i = startIndex; i < textChunks.length; i++) {
        const item = textChunks[i];

        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: item,
          encoding_format: "float",
        });
        console.log("embedding======", embedding);

        embeddings.push(embedding.data[0].embedding);

        // 输出完成嵌入的序号
        console.log(`Completed embedding for chunk ${i}.`);
      }

      console.log(embeddings);

      // 将 embeddings 写入文件
      const filePath = path.join(
        process.cwd(),
        "src",
        "pages",
        "api",
        "embedding.txt"
      );
      fs.writeFileSync(filePath, JSON.stringify(embeddings));

      // 更新已完成嵌入的序号
      const updatedIndex = startIndex + embeddings.length;
      const startIndexFilePath = path.join(
        process.cwd(),
        "src",
        "pages",
        "api",
        "startIndex.txt"
      );
      fs.writeFileSync(startIndexFilePath, updatedIndex.toString());

      res.status(200).json({ embeddings });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ status: "Method not allowed" });
  }
}

import fs from "fs";

async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const filePath = "src/pages/api/jsjwl.txt";
      const content = fs.readFileSync(filePath, "utf-8");
      console.log(content);
      const chunks = splitTextIntoChunks(content, 200);
      const outputPath = "src/pages/api/emjsjwl.txt";

      // 将分隔后的内容写入新文件
      fs.writeFileSync(outputPath, JSON.stringify(chunks), "utf-8");
      console.log("success");
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}

// 分隔文本函数
function splitTextIntoChunks(text, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, "g");
  return text.match(regex);
}

export default handler;

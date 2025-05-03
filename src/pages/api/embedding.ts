import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 1. 从public目录读取已分割的文本数组
      const inputPath = path.join(process.cwd(), 'public', 'payloadjsjwl.txt');
      const content = fs.readFileSync(inputPath, 'utf-8');
      const textChunks = JSON.parse(content); // 直接解析为数组

      if (!Array.isArray(textChunks)) {
        throw new Error('Invalid input format: expected JSON array');
      }
      console.log(`Loaded ${textChunks.length} pre-processed chunks`);

      // 2. 处理断点续传
      let startIndex = 0;
      const progressPath = path.join(process.cwd(), 'public', 'emjsjwl_progress.txt');

      if (fs.existsSync(progressPath)) {
        const progress = fs.readFileSync(progressPath, 'utf-8').trim();
        startIndex = parseInt(progress) || 0;
        console.log(`Resuming from index: ${startIndex}`);
      }

      // 3. 准备输出文件（覆盖模式）
      const outputPath = path.join(process.cwd(), 'public', 'emjsjwl.txt');
      if (startIndex === 0) {
        fs.writeFileSync(outputPath, '[\n'); // 初始化JSON数组
      }

      // 4. 处理每个文本块
      const batchSize = 5; // 百度API支持批量处理
      for (let i = startIndex; i < textChunks.length; i += batchSize) {
        const batch = textChunks
          .slice(i, i + batchSize)
          .map((text) => text.replace(/\s+/g, ' ').trim())
          .filter((text) => text.length > 0);

        if (batch.length === 0) continue;

        // 调用百度API
        const response = await fetch(
          'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/embeddings/embedding-v1',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BAIDU_API_KEY}`,
            },
            body: JSON.stringify({
              input: batch, // 批量发送
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.error_code) {
          throw new Error(`API error: ${result.error_msg}`);
        }

        // 写入结果（追加模式）
        const embeddings = result.data.map((item) => item.embedding);
        const outputContent =
          embeddings.map((emb) => JSON.stringify(emb)).join(',\n') +
          (i + batchSize < textChunks.length ? ',\n' : '\n]');

        fs.appendFileSync(outputPath, outputContent);
        fs.writeFileSync(progressPath, (i + batchSize).toString());

        console.log(`Processed batch ${i}-${i + batchSize - 1}`);
      }

      // 5. 完成处理
      console.log('All embeddings saved to public/emjsjwl.txt');
      res.status(200).json({
        success: true,
        total_chunks: textChunks.length,
        processed_chunks: textChunks.length - startIndex,
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};

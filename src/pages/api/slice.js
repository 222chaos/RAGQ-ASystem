import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 1. 读取文件内容
      const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'czxt.txt');
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log('Original content length:', content.length);

      // 2. 按换行符分割并过滤空行
      let textChunks = content.split('\n').filter((chunk) => chunk.trim() !== '');

      // 3. 合并小段，确保每块至少200字符
      for (let i = 0; i < textChunks.length - 1; i++) {
        while ((textChunks[i] + textChunks[i + 1]).length < 200 && i < textChunks.length - 1) {
          textChunks[i] += ' ' + textChunks[i + 1].trim(); // 用空格连接并trim
          textChunks.splice(i + 1, 1);
        }
      }

      // 4. 处理断点续传
      let startIndex = 0;
      const startIndexFilePath = path.join(process.cwd(), 'src', 'pages', 'api', 'si.txt');
      if (fs.existsSync(startIndexFilePath)) {
        const startIndexContent = fs.readFileSync(startIndexFilePath, 'utf-8').trim();
        startIndex = parseInt(startIndexContent) || 0;
      }

      // 5. 处理并清理文本块
      const processedChunks = [];
      for (let i = startIndex; i < textChunks.length; i++) {
        // 关键修改：彻底清理所有空白字符
        const cleanedChunk = textChunks[i]
          .replace(/[\n\r\t]/g, '') // 完全移除（不是替换为空格）
          .replace(/\s+/g, ' ') // 合并剩余空格
          .trim();

        if (cleanedChunk.length > 0) {
          // 确保非空
          processedChunks.push(cleanedChunk);
        }

        // 更新断点
        fs.writeFileSync(startIndexFilePath, (i + 1).toString());
      }

      // 6. 保存结果（紧凑JSON格式，无多余空格）
      const outputPath = path.join(process.cwd(), 'src', 'pages', 'api', 'payloadczxt.txt');
      fs.writeFileSync(outputPath, JSON.stringify(processedChunks)); // 无格式化空格

      console.log(`Processed ${processedChunks.length} clean chunks`);
      res.status(200).json({
        success: true,
        chunkCount: processedChunks.length,
        sample: processedChunks[0], // 返回完整首元素
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};

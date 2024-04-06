import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const content = `  
     `;

    console.log('Received request content:', content);

    let textChunks = content.split('\n');

    // 合并内容，确保每个item长度不少于200字
    for (let i = 0; i < textChunks.length - 1; i++) {
      while ((textChunks[i] + textChunks[i + 1]).length < 200) {
        textChunks[i] += '\n' + textChunks[i + 1];
        textChunks.splice(i + 1, 1);
      }
    }

    let startIndex = 0;
    try {
      const startIndexFilePath = path.join(process.cwd(), 'src', 'pages', 'api', 'si.txt');

      // 读取已经完成嵌入的序号
      if (fs.existsSync(startIndexFilePath)) {
        const startIndexContent = fs.readFileSync(startIndexFilePath, 'utf-8');
        console.log('Start Index file content:', startIndexContent);
        startIndex = parseInt(startIndexContent.trim());
        console.log('Start Index:', startIndex);
      }
    } catch (error) {
      console.error('Error reading startIndex:', error.message);
    }

    try {
      for (let i = startIndex; i < textChunks.length; i++) {
        const item = textChunks[i];

        // 将当前 item 写入文件
        const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'xqgc.txt');
        fs.appendFileSync(
          filePath,
          JSON.stringify(item) + ',', // 在每个 item 后添加逗号以分隔
        );

        // 更新已完成嵌入的序号
        const updatedIndex = i + 1;
        const startIndexFilePath = path.join(process.cwd(), 'src', 'pages', 'api', 'si.txt');
        fs.writeFileSync(startIndexFilePath, updatedIndex.toString());

        console.log('Updated startIndex file with index:', updatedIndex);
      }

      console.log('All content processed.');
      res.status(200).json({ message: 'Content written to file' });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ status: 'Method not allowed' });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};

import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.PROXY_URL,
});

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
      const startIndexFilePath = path.join(process.cwd(), 'src', 'pages', 'api', 'siczxt.txt');

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
      const embeddings = [];
      for (let i = startIndex; i < textChunks.length; i++) {
        const item = textChunks[i];

        await openai.embeddings
          .create({
            model: 'text-embedding-ada-002',
            input: item,
            encoding_format: 'float',
          })
          .then((embedding) => {
            embeddings.push(embedding.data[0].embedding);
            console.log(`Completed embedding ${i}.`);

            // 将当前 embedding 写入文件
            const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'emczxt.txt');
            fs.appendFileSync(filePath, JSON.stringify(embedding.data[0].embedding) + ',');

            // 更新已完成嵌入的序号
            const updatedIndex = i + 1;
            const startIndexFilePath = path.join(
              process.cwd(),
              'src',
              'pages',
              'api',
              'siczxt.txt',
            );
            fs.writeFileSync(startIndexFilePath, updatedIndex.toString());

            console.log('Updated startIndex file with index:', updatedIndex);
          });
      }

      console.log('All embeddings processed.');
      res.status(200).json({ embeddings });
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

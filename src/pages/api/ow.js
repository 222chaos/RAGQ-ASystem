import { QdrantClient } from '@qdrant/js-client-rest';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const filePath = 'public/payloadczxt.txt';
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log('jsjwl.len:', content.length);

      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });

      const prepareData = async () => {
        const collectionName = 'czxt';
        let result = await client.getCollections();
        const collectionNames = result.collections.map((c) => c.name);

        // 批量处理参数
        const BATCH_SIZE = 5; // 每批处理100条记录
        const totalBatches = Math.ceil(content.length / BATCH_SIZE);

        for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
          const startIdx = batchNum * BATCH_SIZE;
          const endIdx = Math.min(startIdx + BATCH_SIZE, content.length);

          // 准备批量操作
          const operations = [];
          for (let i = startIdx; i < endIdx; i++) {
            operations.push({
              payload: { content: content[i] },
              points: [i],
            });
          }

          // 批量更新
          await Promise.all(operations.map((op) => client.overwritePayload(collectionName, op)));

          console.log(`已处理批次 ${batchNum + 1}/${totalBatches} (${startIdx}-${endIdx - 1})`);
        }
      };

      await prepareData();
      res.status(200).json({
        success: true,
        message: '数据上传完成',
        count: content.length,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: '处理失败',
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ status: 'Method not allowed' });
  }
}

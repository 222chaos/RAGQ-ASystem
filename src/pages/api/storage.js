import { QdrantClient } from '@qdrant/js-client-rest';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const filePath = path.resolve('public/emczxt.txt');
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log('Total records:', content.length);

      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });

      // 集合配置
      const collectionName = 'czxt';
      const vectorSize = 384; // 如果是百度Embedding V1应该是1024
      const distanceMetric = 'Cosine'; // 文本推荐用Cosine

      // 删除并重建集合（可选）
      const { collections } = await client.getCollections();
      if (collections.some((c) => c.name === collectionName)) {
        await client.deleteCollection(collectionName);
      }

      await client.createCollection(collectionName, {
        vectors: { size: vectorSize, distance: distanceMetric },
        optimizers_config: { default_segment_number: 2 },
        replication_factor: 2,
      });

      // 批量处理参数
      const batchSize = 5; // 每批处理100条记录
      const totalBatches = Math.ceil(content.length / batchSize);
      let successfulUploads = 0;

      // 分批处理
      for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        const startIdx = batchNum * batchSize;
        const endIdx = Math.min(startIdx + batchSize, content.length);
        const batch = content.slice(startIdx, endIdx);

        // 准备批量数据点
        const points = batch.map((item, idx) => ({
          id: startIdx + idx,
          vector: item,
          payload: { text: startIdx + idx },
        }));

        try {
          await client.upsert(collectionName, {
            points,
            wait: true,
          });
          successfulUploads += batch.length;
          console.log(`Batch ${batchNum + 1}/${totalBatches} uploaded (${startIdx}-${endIdx - 1})`);
        } catch (error) {
          console.error(`Error uploading batch ${batchNum}:`, error.message);
          // 可以在这里添加重试逻辑
        }
      }

      console.log(`Upload completed. Success: ${successfulUploads}/${content.length}`);
      res.status(200).json({
        success: true,
        message: 'Data uploaded successfully',
        totalRecords: content.length,
        uploadedRecords: successfulUploads,
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  } else {
    res.status(405).json({
      status: 'Method not allowed',
      allowedMethods: ['POST'],
    });
  }
}

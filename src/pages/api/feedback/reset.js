import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { recordId } = req.body;

    if (!recordId) {
      return res.status(400).json({ message: '缺少记录ID' });
    }

    // 清空反馈相关字段
    await sql`
      UPDATE chat_records 
      SET 
        feedback_type = NULL,
        feedback_rating = NULL,
        feedback_content = NULL
      WHERE record_id = ${recordId}
    `;

    return res.status(200).json({
      success: true,
      message: '反馈已撤销',
    });
  } catch (error) {
    console.error('撤销反馈失败:', error);
    return res.status(500).json({
      success: false,
      message: '撤销反馈失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

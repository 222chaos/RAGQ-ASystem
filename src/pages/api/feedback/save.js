import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { messageId, type, rating, content, userId } = req.body;

    if (!messageId || !type || !rating || !content || !userId) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    // 更新聊天记录的反馈信息
    await sql`
      UPDATE chat_records 
      SET 
        feedback_type = ${type},
        feedback_rating = ${rating},
        feedback_content = ${content}
      WHERE record_id = ${messageId} AND user_id = ${userId}
    `;

    return res.status(200).json({
      success: true,
      message: '反馈保存成功',
    });
  } catch (error) {
    console.error('保存反馈失败:', error);
    return res.status(500).json({
      success: false,
      message: '保存反馈失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

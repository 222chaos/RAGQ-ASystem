import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { userId, recordId, subject, question, answer } = req.body;

    if (!userId || !recordId || !subject || !question || !answer) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    // 插入聊天记录
    await sql`
      INSERT INTO chat_records (
        user_id, 
        record_id, 
        subject, 
        question, 
        answer, 
        created_at
      ) VALUES (
        ${userId}, 
        ${recordId}, 
        ${subject}, 
        ${question}, 
        ${answer}, 
        NOW()
      )
    `;

    return res.status(200).json({
      success: true,
      message: '聊天记录保存成功',
      data: { recordId },
    });
  } catch (error) {
    console.error('保存聊天记录失败:', error);
    return res.status(500).json({
      success: false,
      message: '保存聊天记录失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { userId, subject } = req.query;

    if (!userId) {
      return res.status(400).json({ message: '缺少用户ID' });
    }

    // 构建查询条件
    let query = sql`
      SELECT id, record_id, subject, question, answer, created_at, feedback_type, feedback_content, feedback_rating
      FROM chat_records
      WHERE user_id = ${userId}
    `;

    // 如果有科目参数，则按科目筛选
    if (subject) {
      query = sql`
        SELECT id, record_id, subject, question, answer, created_at, feedback_type, feedback_content, feedback_rating
        FROM chat_records
        WHERE user_id = ${userId} AND subject = ${subject}
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
        SELECT id, record_id, subject, question, answer, created_at, feedback_type, feedback_content, feedback_rating
        FROM chat_records
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    }

    // 执行查询
    const records = await query;

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取聊天记录失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

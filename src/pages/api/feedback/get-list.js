import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    // 获取当前用户的会话信息
    const session = await getServerSession(req, res, authOptions);

    // 如果没有会话或用户未登录，返回未授权错误
    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: '未授权，请先登录',
      });
    }

    const userId = session.user.id;

    // 只获取当前用户的反馈记录
    const feedbacks = await sql`
      SELECT 
        c.id, 
        c.record_id, 
        c.subject, 
        c.question, 
        c.answer,
        c.feedback_type, 
        c.feedback_content, 
        c.feedback_rating, 
        c.created_at,
        u.username as user_name,
        u.type as user_type
      FROM 
        chat_records c
      JOIN 
        users u ON c.user_id = u.id
      WHERE 
        c.feedback_type IS NOT NULL
        AND c.user_id = ${userId}
      ORDER BY 
        c.created_at DESC
    `;

    return res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取反馈列表失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

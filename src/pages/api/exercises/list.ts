import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id || session.user.type !== 'student') {
      return res.status(401).json({ message: '未授权' });
    }

    // 获取学生的教师ID
    const studentResult = await sql`
      SELECT teacher_user_id 
      FROM students 
      WHERE user_id = ${session.user.id}
    `;

    if (!studentResult || studentResult.length === 0) {
      return res.status(404).json({ message: '未找到学生信息' });
    }

    const teacherUserId = studentResult[0].teacher_user_id;

    // 获取教师发布的练习
    const exercises = await sql`
      SELECT 
        id,
        title,
        description,
        content,
        difficulty,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD') as created_at,
        TO_CHAR(deadline, 'YYYY-MM-DD') as deadline
      FROM exercises
      WHERE teacher_user_id = ${teacherUserId}
      AND status = '已发布'
      ORDER BY created_at DESC
    `;

    res.status(200).json({
      data: exercises,
    });
  } catch (error) {
    console.error('获取练习列表失败:', error);
    res.status(500).json({
      message: '获取练习列表失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

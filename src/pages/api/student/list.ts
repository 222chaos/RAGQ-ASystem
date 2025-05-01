import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { teacherUserId } = req.query;

    if (!teacherUserId) {
      return res.status(400).json({ message: '缺少教师ID' });
    }

    const students = await sql`
      SELECT 
        s.id,
        s.name,
        s.student_id as "studentId",
        s.class_name as "class",
        s.phone,
        s.email
      FROM students s
      WHERE s.teacher_user_id = ${teacherUserId}
      ORDER BY s.student_id
    `;

    res.status(200).json({
      data: students,
    });
  } catch (error) {
    console.error('获取学生列表失败:', error);
    res.status(500).json({
      message: '获取学生列表失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

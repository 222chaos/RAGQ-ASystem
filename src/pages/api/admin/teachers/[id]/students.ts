import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.type !== 'admin') {
    return res.status(401).json({ message: '未授权' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: '缺少教师ID' });
    }

    const result = await sql`
      SELECT 
        s.id,
        s.name,
        s.student_id as "studentId",
        s.class_name as "className",
        s.phone,
        s.email,
        COUNT(cr.id) as "qaCount"
      FROM students s
      LEFT JOIN chat_records cr ON s.user_id = cr.user_id
      WHERE s.teacher_user_id = ${id}
      GROUP BY s.id, s.name, s.student_id, s.class_name, s.phone, s.email
      ORDER BY s.student_id
    `;

    const students = result.map((row) => ({
      id: row.id,
      name: row.name,
      studentId: row.studentId,
      className: row.className,
      phone: row.phone,
      email: row.email,
      qaCount: parseInt(row.qaCount),
    }));

    res.status(200).json(students);
  } catch (error) {
    console.error('获取教师学生列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

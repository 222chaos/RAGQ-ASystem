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
    if (!session?.user?.id) {
      return res.status(401).json({ message: '未授权' });
    }

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: '缺少用户ID' });
    }

    // 从 students 表中获取学生信息
    const result = await sql`
      SELECT s.id, s.name, s.student_id, s.class_name, s.phone, s.email 
      FROM students s 
      WHERE s.user_id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: '未找到学生信息' });
    }

    const studentInfo = result[0];
    return res.status(200).json({
      id: studentInfo.id,
      name: studentInfo.name,
      student_id: studentInfo.student_id,
      class_name: studentInfo.class_name,
      phone: studentInfo.phone,
      email: studentInfo.email,
    });
  } catch (error) {
    console.error('获取学生信息失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

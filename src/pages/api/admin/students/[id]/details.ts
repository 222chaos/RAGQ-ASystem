import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.type || session.user.type !== 'admin') {
    return res.status(401).json({ message: '未授权' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: '缺少学生ID' });
    }

    // 获取学生基本信息
    const studentResult = await sql`
      SELECT 
        s.id,
        s.name,
        s.student_id as "studentId",
        s.class_name as "className",
        s.phone,
        s.email,
        u.username as "teacherUsername",
        COUNT(cr.id) as "qaCount"
      FROM students s
      LEFT JOIN users u ON s.teacher_user_id = u.id
      LEFT JOIN chat_records cr ON s.user_id = cr.user_id
      WHERE s.id = ${id}
      GROUP BY s.id, s.name, s.student_id, s.class_name, s.phone, s.email, u.username
    `;

    if (studentResult.length === 0) {
      return res.status(404).json({ message: '未找到学生信息' });
    }

    // 获取学生的问答记录
    const qaRecordsResult = await sql`
      SELECT 
        cr.id,
        cr.subject,
        cr.question,
        cr.answer,
        cr.created_at as "createdAt"
      FROM chat_records cr
      WHERE cr.user_id = (SELECT user_id FROM students WHERE id = ${id})
      ORDER BY cr.created_at DESC
      LIMIT 10
    `;

    const studentInfo = studentResult[0];
    const studentDetails = {
      id: studentInfo.id,
      name: studentInfo.name,
      studentId: studentInfo.studentId,
      className: studentInfo.className,
      phone: studentInfo.phone,
      email: studentInfo.email,
      teacherUsername: studentInfo.teacherUsername,
      qaCount: parseInt(studentInfo.qaCount),
      recentQARecords: qaRecordsResult.map((record) => ({
        id: record.id,
        subject: record.subject,
        question: record.question,
        answer: record.answer,
        createdAt: record.createdAt,
      })),
    };

    res.status(200).json(studentDetails);
  } catch (error) {
    console.error('获取学生详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

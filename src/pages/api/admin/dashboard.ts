import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.type !== 'admin') {
    return res.status(401).json({ message: '未授权' });
  }

  try {
    // 获取教师总数
    const teacherCountResult = await sql`
      SELECT COUNT(*) FROM users WHERE type = 'teacher'
    `;
    const totalTeachers = parseInt(teacherCountResult[0].count);

    // 获取学生总数
    const studentCountResult = await sql`
      SELECT COUNT(*) FROM users WHERE type = 'student'
    `;
    const totalStudents = parseInt(studentCountResult[0].count);

    // 获取总问答次数
    const qaCountResult = await sql`
      SELECT COUNT(*) FROM chat_records
    `;
    const totalQASessions = parseInt(qaCountResult[0].count);

    // 获取总练习数
    const exerciseCountResult = await sql`
      SELECT COUNT(*) FROM exercises
    `;
    const totalExercises = parseInt(exerciseCountResult[0].count);

    // 获取教师统计数据
    const teacherStatsResult = await sql`
      SELECT 
        u.id,
        u.username as name,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(DISTINCT cr.id) as qa_count,
        COUNT(DISTINCT e.id) as exercise_count
      FROM users u
      LEFT JOIN students s ON s.teacher_user_id = u.id
      LEFT JOIN chat_records cr ON cr.user_id = u.id
      LEFT JOIN exercises e ON e.teacher_user_id = u.id
      WHERE u.type = 'teacher'
      GROUP BY u.id, u.username
    `;

    const teacherStats = teacherStatsResult.map((row) => ({
      id: row.id,
      name: row.name,
      studentCount: parseInt(row.student_count),
      qaCount: parseInt(row.qa_count),
      exerciseCount: parseInt(row.exercise_count),
    }));

    res.status(200).json({
      totalTeachers,
      totalStudents,
      totalQASessions,
      totalExercises,
      teacherStats,
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

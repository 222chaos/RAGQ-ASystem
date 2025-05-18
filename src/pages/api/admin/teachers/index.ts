import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.type !== 'admin') {
    return res.status(401).json({ message: '未授权' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const result = await sql`
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

        const teachers = result.map((row) => ({
          id: row.id,
          name: row.name,
          studentCount: parseInt(row.student_count),
          qaCount: parseInt(row.qa_count),
          exerciseCount: parseInt(row.exercise_count),
        }));

        res.status(200).json(teachers);
      } catch (error) {
        console.error('获取教师列表失败:', error);
        res.status(500).json({ message: '服务器错误' });
      }
      break;

    case 'POST':
      try {
        const { name, password } = req.body;

        // 检查用户名是否已存在
        const existingUser = await sql`
          SELECT id FROM users WHERE username = ${name}
        `;
        if (existingUser.length > 0) {
          return res.status(400).json({ message: '该用户名已被注册' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建教师用户
        const result = await sql`
          INSERT INTO users (username, password, type)
          VALUES (${name}, ${hashedPassword}, 'teacher')
          RETURNING id
        `;

        res.status(201).json({
          id: result[0].id,
          name,
          studentCount: 0,
          qaCount: 0,
          exerciseCount: 0,
        });
      } catch (error) {
        console.error('创建教师失败:', error);
        res.status(500).json({ message: '服务器错误' });
      }
      break;

    default:
      res.status(405).json({ message: '方法不允许' });
  }
}

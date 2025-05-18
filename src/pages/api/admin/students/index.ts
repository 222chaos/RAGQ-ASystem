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
          GROUP BY s.id, s.name, s.student_id, s.class_name, s.phone, s.email, u.username
          ORDER BY s.id DESC
        `;

        const students = Array.isArray(result)
          ? result.map((row) => ({
              id: row.id,
              name: row.name,
              studentId: row.studentId,
              className: row.className,
              phone: row.phone,
              email: row.email,
              teacherUsername: row.teacherUsername,
              qaCount: parseInt(row.qaCount),
            }))
          : [];

        res.status(200).json(students);
      } catch (error) {
        console.error('获取学生列表失败:', error);
        res.status(500).json({ message: '服务器错误' });
      }
      break;

    case 'POST':
      try {
        const { name, password, teacherId, studentId, className, phone, email } = req.body;

        // 检查用户名是否已存在
        const existingUser = await sql`
          SELECT id FROM users WHERE username = ${name}
        `;
        if (existingUser.length > 0) {
          return res.status(400).json({ message: '该用户名已被注册' });
        }

        // 检查学号是否已存在
        const existingStudent = await sql`
          SELECT id FROM students WHERE student_id = ${studentId}
        `;
        if (existingStudent.length > 0) {
          return res.status(400).json({ message: '该学号已被注册' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 开始事务
        await sql`BEGIN`;

        try {
          // 创建用户
          const userResult = await sql`
            INSERT INTO users (username, password, type)
            VALUES (${name}, ${hashedPassword}, 'student')
            RETURNING id
          `;

          const userId = userResult[0].id;

          // 创建学生记录
          await sql`
            INSERT INTO students (user_id, teacher_user_id, name, student_id, class_name, phone, email)
            VALUES (${userId}, ${teacherId}, ${name}, ${studentId}, ${className}, ${phone}, ${email})
          `;

          await sql`COMMIT`;

          res.status(201).json({
            id: userId,
            name,
            studentId,
            className,
            phone,
            email,
            teacherId,
            qaCount: 0,
          });
        } catch (error) {
          await sql`ROLLBACK`;
          throw error;
        }
      } catch (error) {
        console.error('创建学生失败:', error);
        res.status(500).json({ message: '服务器错误' });
      }
      break;

    default:
      res.status(405).json({ message: '方法不允许' });
  }
}

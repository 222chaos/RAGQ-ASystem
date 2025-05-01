import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import registerHandler from './register';

const sql = neon(process.env.DATABASE_URL!);

interface RegisterResponse {
  code: number;
  data: {
    user: {
      id: string;
    };
    message?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { name, studentId, className, phone, email, teacherUserId } = req.body;

  if (!name || !studentId || !className || !teacherUserId) {
    return res.status(400).json({ message: '缺少必要信息' });
  }

  try {
    const teacherUser = await sql`
      SELECT id FROM users WHERE id = ${teacherUserId} AND type = 'teacher'
    `;

    if (!teacherUser || teacherUser.length === 0) {
      return res.status(400).json({ message: '指定的教师用户不存在' });
    }

    const existingStudent = await sql`
      SELECT id FROM students WHERE student_id = ${studentId}
    `;

    if (existingStudent && existingStudent.length > 0) {
      return res.status(400).json({ message: '该学号已被使用' });
    }

    await sql`BEGIN`;

    try {
      const mockReq = {
        method: 'POST',
        body: {
          username: studentId,
          password: '123456',
          type: 'student',
        },
      } as NextApiRequest;

      let registerResult: RegisterResponse | null = null;

      await registerHandler(mockReq, {
        status: (statusCode: number) => ({
          json: (data: any) => {
            registerResult = { code: statusCode, data };
            return null;
          },
        }),
      } as any);

      if (!registerResult || registerResult.code !== 201) {
        throw new Error(registerResult?.data?.message || '用户创建失败');
      }

      const userId = registerResult.data.user.id;

      await sql`
        INSERT INTO students 
        (user_id, teacher_user_id, name, student_id, class_name, phone, email) 
        VALUES (${userId}, ${teacherUserId}, ${name}, ${studentId}, ${className}, ${phone}, ${email})
      `;

      await sql`COMMIT`;

      res.status(201).json({
        message: '学生注册成功',
        data: {
          userId,
          studentId,
          name,
          className,
        },
      });
    } catch (innerError) {
      await sql`ROLLBACK`;
      throw innerError;
    }
  } catch (error) {
    console.error('注册学生失败:', error);
    res.status(500).json({
      message: '注册学生失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

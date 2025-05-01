import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { id, name, studentId, className, phone, email } = req.body;

    if (!id || !name || !studentId || !className) {
      return res.status(400).json({ message: '缺少必要信息' });
    }

    // 检查学号是否已被其他学生使用
    const existingStudent = await sql`
      SELECT id FROM students 
      WHERE student_id = ${studentId} AND id != ${id}
    `;

    if (existingStudent && existingStudent.length > 0) {
      return res.status(400).json({ message: '该学号已被其他学生使用' });
    }

    await sql`
      UPDATE students 
      SET 
        name = ${name},
        student_id = ${studentId},
        class_name = ${className},
        phone = ${phone},
        email = ${email}
      WHERE id = ${id}
    `;

    res.status(200).json({
      message: '更新成功',
      data: {
        id,
        name,
        studentId,
        className,
        phone,
        email,
      },
    });
  } catch (error) {
    console.error('更新学生信息失败:', error);
    res.status(500).json({
      message: '更新学生信息失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

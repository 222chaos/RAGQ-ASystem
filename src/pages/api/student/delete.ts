import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: '缺少学生ID' });
    }

    // 开始事务
    await sql`BEGIN`;

    try {
      // 获取学生信息以删除关联的用户账号
      const student = await sql`
        SELECT user_id FROM students WHERE id = ${id}
      `;

      if (!student || student.length === 0) {
        throw new Error('学生不存在');
      }

      const userId = student[0].user_id;

      // 删除学生记录
      await sql`
        DELETE FROM students WHERE id = ${id}
      `;

      // 删除关联的用户账号
      await sql`
        DELETE FROM users WHERE id = ${userId}
      `;

      // 提交事务
      await sql`COMMIT`;

      res.status(200).json({
        message: '删除成功',
      });
    } catch (error) {
      // 回滚事务
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('删除学生失败:', error);
    res.status(500).json({
      message: '删除学生失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

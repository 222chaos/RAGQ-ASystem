import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { id, phone, email } = req.body;

    if (!id) {
      return res.status(400).json({ message: '缺少学生ID' });
    }

    await sql`
      UPDATE students 
      SET 
        phone = ${phone},
        email = ${email}
      WHERE id = ${id}
    `;

    res.status(200).json({
      message: '更新成功',
      data: {
        id,
        phone,
        email,
      },
    });
  } catch (error) {
    console.error('更新联系方式失败:', error);
    res.status(500).json({
      message: '更新联系方式失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

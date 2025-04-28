import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: '未授权' });
    }

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }

    // 检查用户名是否已存在
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username} AND id != ${session.user.id}
    `;

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 更新用户名
    const result = await sql`
      UPDATE users 
      SET username = ${username}
      WHERE id = ${session.user.id}
      RETURNING username
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    return res.status(200).json({
      message: '用户名更新成功',
      username: result[0].username,
    });
  } catch (error) {
    console.error('更新用户名失败:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: '更新用户名失败' });
  }
}

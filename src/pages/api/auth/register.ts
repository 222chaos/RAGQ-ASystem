import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { username, password, type } = req.body;

    if (!username || !password || !type) {
      return res.status(400).json({ message: '请提供用户名、密码和用户类型' });
    }

    // 检查用户名是否已存在
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const result = await sql`
      INSERT INTO users (username, password, type)
      VALUES (${username}, ${hashedPassword}, ${type})
      RETURNING id, username, type
    `;

    if (!result || result.length === 0) {
      throw new Error('创建用户失败');
    }

    return res.status(201).json({
      message: '注册成功',
      user: {
        id: result[0].id,
        username: result[0].username,
        type: result[0].type,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: '注册失败' });
  }
}

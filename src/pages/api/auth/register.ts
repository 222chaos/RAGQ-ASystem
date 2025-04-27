import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '请提供用户名和密码' });
  }

  try {
    // 检查用户名是否已存在
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: '该用户名已被使用' });
    }

    // 创建新用户
    await sql`
      INSERT INTO users (username, password)
      VALUES (${username}, ${password})
    `;

    return res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({ message: '注册失败' });
  }
}

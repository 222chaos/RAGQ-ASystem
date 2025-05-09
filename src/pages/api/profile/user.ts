import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: '未授权' });
    }

    const result = await sql`
      SELECT id, username, type, avatar_url
      FROM users 
      WHERE id = ${session.user.id}
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = result[0];

    return res.status(200).json({
      id: user.id,
      username: user.username,
      type: user.type,
      avatarUrl: user.avatar_url,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: '获取用户信息失败' });
  }
}

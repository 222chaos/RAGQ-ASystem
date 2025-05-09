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

    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: '头像URL不能为空' });
    }

    // 直接存储Base64数据
    const result = await sql`
      UPDATE users 
      SET avatar_url = ${avatarUrl}
      WHERE id = ${session.user.id}
      RETURNING avatar_url
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 返回更新后的头像URL
    return res.status(200).json({
      message: '头像更新成功',
      avatarUrl: result[0].avatar_url,
    });
  } catch (error) {
    console.error('更新头像失败:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: '更新头像失败' });
  }
}

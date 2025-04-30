import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
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

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '密码不能为空' });
    }

    // 获取当前用户信息
    const user = await sql`
      SELECT password FROM users WHERE id = ${session.user.id}
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 验证当前密码
    const isValid = await bcrypt.compare(currentPassword, user[0].password);
    if (!isValid) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE id = ${session.user.id}
    `;

    return res.status(200).json({
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: '修改密码失败' });
  }
}

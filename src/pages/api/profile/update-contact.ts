import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: '未授权' });
    }

    const { phone, email } = req.body;
    if (!phone || !email) {
      return res.status(400).json({ message: '手机号和邮箱不能为空' });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: '请输入有效的手机号码' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '请输入有效的邮箱地址' });
    }

    // 更新学生联系方式
    const result = await sql`
      UPDATE students 
      SET phone = ${phone}, email = ${email}
      WHERE user_id = ${session.user.id}
      RETURNING id, phone, email
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: '未找到学生信息' });
    }

    return res.status(200).json({
      message: '联系方式更新成功',
      data: {
        phone: result[0].phone,
        email: result[0].email,
      },
    });
  } catch (error) {
    console.error('更新联系方式失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

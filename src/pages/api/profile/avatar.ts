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
      return res.status(400).json({ message: '头像数据不能为空' });
    }

    // 检查是否是图片数据
    if (!avatarUrl.includes('data:image/')) {
      return res.status(400).json({ message: '请上传图片文件' });
    }

    // 检查图片格式
    const imageType = avatarUrl.split(';')[0].split('/')[1];
    if (!['jpeg', 'jpg', 'png', 'gif'].includes(imageType.toLowerCase())) {
      return res.status(400).json({ message: '不支持的图片格式，仅支持 jpg、png、gif' });
    }

    // 获取Base64数据部分
    const base64Data = avatarUrl.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({ message: '无效的图片数据' });
    }

    // 将Base64转换为二进制
    const binaryData = Buffer.from(base64Data, 'base64');

    // 更新用户头像
    await sql`
      UPDATE users 
      SET avatar_url = ${binaryData}
      WHERE id = ${session.user.id}
    `;

    return res.status(200).json({
      message: '头像更新成功',
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    console.error('更新头像失败:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: '更新头像失败' });
  }
}

import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: '文件上传失败' });
      }

      const file = files.avatar as formidable.File;
      if (!file) {
        return res.status(400).json({ message: '未找到上传文件' });
      }

      // 生成唯一的文件名
      const fileName = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(process.cwd(), 'public/uploads', fileName);

      // 重命名文件
      fs.rename(file.filepath, newPath, (err) => {
        if (err) {
          return res.status(500).json({ message: '文件保存失败' });
        }

        // 返回文件访问路径
        res.status(200).json({
          url: `/uploads/${fileName}`,
        });
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

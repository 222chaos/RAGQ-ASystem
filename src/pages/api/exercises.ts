import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }

  if (req.method === 'GET') {
    try {
      const { teacher_user_id, status } = req.query;

      // 确定教师ID
      const actualTeacherId = teacher_user_id || session.user.id;

      // 使用条件片段构建查询
      let query = sql`
        SELECT 
          id,
          teacher_user_id,
          title,
          description,
          content,
          difficulty,
          status,
          TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
          TO_CHAR(deadline, 'YYYY-MM-DD HH24:MI:SS') as deadline
        FROM exercises
        WHERE teacher_user_id = ${actualTeacherId}
      `;

      if (status) {
        query = sql`${query} AND status = ${status}`;
      }

      query = sql`${query} ORDER BY created_at DESC`;

      // 创建表（保持不变）
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS exercises (
            id SERIAL PRIMARY KEY,
            teacher_user_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            content TEXT NOT NULL,
            difficulty VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT '草稿',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            deadline TIMESTAMP NULL
          )
        `;
      } catch (err) {
        console.error('创建表出错:', err);
      }

      // 执行查询
      const result = await query;
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') {
    try {
      // 验证用户类型，只有教师可以创建练习
      if (session.user.type !== 'teacher') {
        return res.status(403).json({ error: '只有教师可以创建练习' });
      }

      const { title, description, content, difficulty, status, deadline } = req.body;

      // 使用当前登录用户ID作为teacher_user_id
      const teacher_user_id = session.user.id;

      // 验证状态值
      if (status && !['草稿', '已发布'].includes(status)) {
        return res.status(400).json({ error: '无效的状态值' });
      }

      const result = await sql`
        INSERT INTO exercises (
          teacher_user_id,
          title,
          description,
          content,
          difficulty,
          status,
          deadline
        ) VALUES (
          ${teacher_user_id},
          ${title},
          ${description},
          ${content},
          ${difficulty},
          ${status || '草稿'},
          ${deadline ? new Date(deadline).toISOString() : null}
        )
        RETURNING 
          id,
          teacher_user_id,
          title,
          description,
          content,
          difficulty,
          status,
          TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
          TO_CHAR(deadline, 'YYYY-MM-DD HH24:MI:SS') as deadline
      `;

      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Error creating exercise:', error);
      res.status(500).json({ error: '创建练习失败' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

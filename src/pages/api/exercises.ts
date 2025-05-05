import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 获取当前用户会话
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }

  if (req.method === 'GET') {
    try {
      const { teacher_user_id, status } = req.query;
      let conditions = [];
      let params = [];

      // 始终过滤当前教师的练习，除非明确提供了teacher_user_id参数
      if (teacher_user_id) {
        conditions.push('teacher_user_id = $1');
        params.push(teacher_user_id);
      } else {
        // 如果未提供teacher_user_id，默认使用当前登录用户的ID
        conditions.push('teacher_user_id = $1');
        params.push(session.user.id);
      }

      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      // 检查表是否存在，如果不存在则创建表
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
        // 表已存在的错误可以忽略
      }

      const result = await sql`
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
        ${whereClause ? sql`${whereClause}` : sql``}
        ORDER BY created_at DESC
      `;

      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // 返回空数组而不是错误状态，让表格显示"暂无数据"
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

import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { teacher_user_id, status } = req.query;
      let conditions = [];
      let params = [];

      if (teacher_user_id) {
        conditions.push('teacher_user_id = $1');
        params.push(teacher_user_id);
      }

      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

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
      res.status(500).json({ error: '获取练习列表失败' });
    }
  } else if (req.method === 'POST') {
    try {
      const { teacher_user_id, title, description, content, difficulty, status, deadline } =
        req.body;

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

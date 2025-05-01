import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // 先检查练习是否存在
      const checkResult = await sql`
        SELECT id FROM exercises WHERE id = ${id}
      `;

      if (checkResult.length === 0) {
        return res.status(404).json({ error: '练习不存在' });
      }

      // 删除练习
      await sql`
        DELETE FROM exercises WHERE id = ${id}
      `;

      res.status(200).json({ message: '删除成功' });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      res.status(500).json({ error: '删除练习失败' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description, content, difficulty, status, deadline } = req.body;

      // 先检查练习是否存在
      const checkResult = await sql`
        SELECT id FROM exercises WHERE id = ${id}
      `;

      if (checkResult.length === 0) {
        return res.status(404).json({ error: '练习不存在' });
      }

      // 更新练习
      const result = await sql`
        UPDATE exercises 
        SET 
          title = ${title},
          description = ${description},
          content = ${content},
          difficulty = ${difficulty},
          status = ${status},
          deadline = ${deadline}
        WHERE id = ${id}
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

      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({ error: '更新练习失败' });
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

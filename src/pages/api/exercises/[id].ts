import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // 获取当前用户会话
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }

  // 验证练习是否存在且属于当前教师
  const checkExercise = async () => {
    const result = await sql`
      SELECT id, teacher_user_id FROM exercises WHERE id = ${id}
    `;

    if (result.length === 0) {
      return { exists: false, message: '练习不存在' };
    }

    if (result[0].teacher_user_id !== session.user.id) {
      return { exists: true, authorized: false, message: '您无权操作此练习' };
    }

    return { exists: true, authorized: true };
  };

  if (req.method === 'DELETE') {
    try {
      const checkResult = await checkExercise();

      if (!checkResult.exists) {
        return res.status(404).json({ error: checkResult.message });
      }

      if (!checkResult.authorized) {
        return res.status(403).json({ error: checkResult.message });
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

      const checkResult = await checkExercise();

      if (!checkResult.exists) {
        return res.status(404).json({ error: checkResult.message });
      }

      if (!checkResult.authorized) {
        return res.status(403).json({ error: checkResult.message });
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

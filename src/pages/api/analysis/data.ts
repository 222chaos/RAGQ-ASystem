import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: '未授权' });
    }

    const userType = session.user.type || 'student';
    const userId = session.user.id;

    // 从数据库获取聊天记录统计
    const chatStatsQuery = await sql`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN answer != '' THEN 1 END) as answered_questions
      FROM chat_records
      WHERE user_id = ${userId}
    `;

    // 获取最近的问题
    const recentQuestionsQuery = await sql`
      SELECT 
        question,
        CASE WHEN answer != '' THEN '已解答' ELSE '待解答' END as status,
        to_char(created_at, 'YYYY-MM-DD HH24:MI') as time,
        subject as category
      FROM chat_records
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 3
    `;

    // 获取按分类统计的问题数量
    const categoryStatsQuery = await sql`
      SELECT 
        subject as name,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM chat_records WHERE user_id = ${userId}) as percentage
      FROM chat_records
      WHERE user_id = ${userId}
      GROUP BY subject
      ORDER BY count DESC
    `;

    // 获取练习统计数据
    const exerciseStatsQuery =
      userType === 'teacher'
        ? await sql`
          SELECT 
            COUNT(*) as total_exercises,
            COUNT(CASE WHEN status = '已发布' THEN 1 END) as published_exercises,
            COUNT(CASE WHEN status = '草稿' THEN 1 END) as draft_exercises,
            COUNT(CASE WHEN deadline < CURRENT_TIMESTAMP THEN 1 END) as expired_exercises
          FROM exercises
          WHERE teacher_user_id = ${userId}
        `
        : await sql`
          SELECT 
            COUNT(e.*) as total_exercises,
            0 as completed_exercises,
            COUNT(CASE WHEN e.deadline < CURRENT_TIMESTAMP THEN 1 END) as overdue_exercises
          FROM exercises e
          JOIN students st ON st.user_id = ${userId}
          WHERE e.teacher_user_id = st.teacher_user_id AND e.status = '已发布'
        `;

    // 获取练习难度分布
    const exerciseDifficultyQuery =
      userType === 'teacher'
        ? await sql`
          SELECT 
            difficulty,
            COUNT(*) as count,
            COUNT(*) * 100.0 / (SELECT COUNT(*) FROM exercises WHERE teacher_user_id = ${userId}) as percentage
          FROM exercises
          WHERE teacher_user_id = ${userId}
          GROUP BY difficulty
          ORDER BY COUNT(*) DESC
        `
        : await sql`
          SELECT 
            e.difficulty,
            COUNT(*) as count,
            COUNT(*) * 100.0 / (
              SELECT COUNT(*) FROM exercises e
              JOIN students st ON st.user_id = ${userId}
              WHERE e.teacher_user_id = st.teacher_user_id AND e.status = '已发布'
            ) as percentage
          FROM exercises e
          JOIN students st ON st.user_id = ${userId}
          WHERE e.teacher_user_id = st.teacher_user_id AND e.status = '已发布'
          GROUP BY e.difficulty
          ORDER BY COUNT(*) DESC
        `;

    const chatStats = chatStatsQuery[0] || {
      total_questions: 0,
      answered_questions: 0,
    };

    const exerciseStats = exerciseStatsQuery[0] || {
      total_exercises: 0,
      published_exercises: 0,
      draft_exercises: 0,
      expired_exercises: 0,
      completed_exercises: 0,
      overdue_exercises: 0,
    };

    // 基础数据
    const baseData = {
      totalQuestions: parseInt(chatStats.total_questions) || 0,
      answeredQuestions: parseInt(chatStats.answered_questions) || 0,
      recentQuestions: recentQuestionsQuery.map((q) => ({
        question: q.question,
        status: q.status,
        time: q.time,
        category: q.category,
      })),
      categoryStats: categoryStatsQuery.map((c) => ({
        name: c.name,
        count: parseInt(c.count),
        percentage: Math.round(parseFloat(c.percentage) || 0),
      })),
      exerciseStats: {
        totalExercises: parseInt(exerciseStats.total_exercises) || 0,
        publishedExercises: parseInt(exerciseStats.published_exercises) || 0,
        draftExercises: parseInt(exerciseStats.draft_exercises) || 0,
        expiredExercises: parseInt(exerciseStats.expired_exercises) || 0,
        completedExercises: parseInt(exerciseStats.completed_exercises) || 0,
        overdueExercises: parseInt(exerciseStats.overdue_exercises) || 0,
      },
      exerciseDifficulty: exerciseDifficultyQuery.map((d) => ({
        difficulty: d.difficulty,
        count: parseInt(d.count),
        percentage: Math.round(parseFloat(d.percentage) || 0),
      })),
      analysisSuggestions: {
        questionPatterns: categoryStatsQuery.slice(0, 3).map((c, i) => ({
          category: c.name,
          pattern: `${c.name}相关问题`,
          count: parseInt(c.count),
          percentage: Math.round(parseFloat(c.percentage) || 0),
        })),
      },
    };

    // 教师特定数据
    if (userType === 'teacher') {
      // 获取教师统计数据
      const teacherStatsQuery = await sql`
        SELECT 
          COUNT(DISTINCT s.id) as total_students,
          COUNT(DISTINCT CASE WHEN cr.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN cr.user_id END) as active_students
        FROM students s
        LEFT JOIN chat_records cr ON s.user_id = cr.user_id
        WHERE s.teacher_user_id = ${userId}
      `;

      const teacherData = {
        ...baseData,
        teacherStats: {
          totalStudents: parseInt(teacherStatsQuery[0]?.total_students || '0'),
          activeStudents: parseInt(teacherStatsQuery[0]?.active_students || '0'),
        },
        analysisSuggestions: {
          ...baseData.analysisSuggestions,
          teachingSuggestions: [
            `${baseData.categoryStats[0]?.name || ''}类问题占比最高，建议在课堂上增加实际案例分析`,
            `已创建${baseData.exerciseStats.totalExercises}个练习，其中有${baseData.exerciseStats.publishedExercises - baseData.exerciseStats.expiredExercises}个当前进行中`,
            `${baseData.exerciseDifficulty[0]?.difficulty || ''}难度的练习占比最高，为${baseData.exerciseDifficulty[0]?.percentage || 0}%`,
          ],
        },
      };

      return res.status(200).json(teacherData);
    }
    // 学生特定数据
    else {
      // 获取学生统计数据
      const studentStatsQuery = await sql`
        SELECT 
          COUNT(*) as total_study_sessions,
          COUNT(DISTINCT subject) as studied_subjects
        FROM chat_records
        WHERE user_id = ${userId}
      `;

      const studentData = {
        ...baseData,
        studentStats: {
          totalStudySessions: parseInt(studentStatsQuery[0]?.total_study_sessions || '0'),
          studiedSubjects: parseInt(studentStatsQuery[0]?.studied_subjects || '0'),
          completedExercises: 0, // 设置为0，因为无法获取已完成练习数
          studyProgress: 0, // 设置为0，因为无法计算学习进度
        },
        analysisSuggestions: {
          ...baseData.analysisSuggestions,
          learningSuggestions: [
            `${baseData.categoryStats[0]?.name || ''}类问题较多，建议加强相关课程的学习，特别是相关方法和工具的使用`,
            `可做的练习总数为${baseData.exerciseStats.totalExercises}个，请积极参与老师布置的练习`,
            `${baseData.exerciseDifficulty[0]?.difficulty || ''}难度的练习占比最高，为${baseData.exerciseDifficulty[0]?.percentage || 0}%，建议按需复习相关内容`,
          ],
          questionAnalysis: [
            {
              type: '概念理解类',
              count: Math.floor(baseData.totalQuestions * 0.5),
              percentage: 50,
              examples: [
                '什么是需求工程？',
                '进程和线程的区别是什么？',
                'TCP三次握手的过程是怎样的？',
              ],
            },
            {
              type: '实践应用类',
              count: Math.floor(baseData.totalQuestions * 0.3),
              percentage: 30,
              examples: [
                '如何编写需求规格说明书？',
                '如何实现进程调度算法？',
                '如何配置网络防火墙？',
              ],
            },
            {
              type: '问题解决类',
              count: Math.floor(baseData.totalQuestions * 0.2),
              percentage: 20,
              examples: ['如何处理需求变更？', '如何解决死锁问题？', '如何排查网络故障？'],
            },
          ],
        },
      };

      return res.status(200).json(studentData);
    }
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return res.status(500).json({
      message: '获取分析数据失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}

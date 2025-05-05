import { neon } from '@neondatabase/serverless';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '../auth/[...nextauth]';

const sql = neon(process.env.DATABASE_URL!);

// 初始化OpenAI客户端（使用DeepSeek API）
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  // 设置响应头，支持流式传输和CORS
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      res.write(`data: ${JSON.stringify({ error: '未授权' })}\n\n`);
      return res.end();
    }

    const userType = session.user.type || 'student';
    const userId = session.user.id;

    // 发送初始消息
    res.write(`data: ${JSON.stringify({ message: 'analysis_start' })}\n\n`);

    // 根据用户类型进行不同的处理
    if (userType === 'teacher') {
      await handleTeacherAnalysis(userId, res);
    } else {
      await handleStudentAnalysis(userId, res);
    }

    // 发送结束消息
    res.write(`data: ${JSON.stringify({ message: 'analysis_complete' })}\n\n`);
    return res.end();
  } catch (error) {
    console.error('深度分析失败:', error);
    res.write(
      `data: ${JSON.stringify({
        error: '获取深度分析失败',
        details: error instanceof Error ? error.message : '未知错误',
      })}\n\n`,
    );
    return res.end();
  }
}

// 处理教师深度分析
async function handleTeacherAnalysis(userId: string, res: NextApiResponse) {
  // 获取该教师的所有学生信息
  const studentsQuery = await sql`
    SELECT 
      s.id, s.name, s.student_id, s.class_name,
      COUNT(DISTINCT cr.id) as question_count
    FROM students s
    LEFT JOIN chat_records cr ON s.user_id = cr.user_id
    WHERE s.teacher_user_id = ${userId}
    GROUP BY s.id, s.name, s.student_id, s.class_name
    ORDER BY question_count DESC
  `;

  // 获取所有问题分类统计
  const categoriesQuery = await sql`
    SELECT 
      cr.subject as category,
      COUNT(*) as count,
      COUNT(*) * 100.0 / (SELECT COUNT(*) FROM chat_records cr 
                          JOIN students s ON cr.user_id = s.user_id 
                          WHERE s.teacher_user_id = ${userId}) as percentage
    FROM chat_records cr
    JOIN students s ON cr.user_id = s.user_id
    WHERE s.teacher_user_id = ${userId}
    GROUP BY cr.subject
    ORDER BY count DESC
  `;

  // 获取练习难度统计
  const exerciseDifficultyQuery = await sql`
    SELECT 
      difficulty,
      COUNT(*) as count,
      COUNT(*) * 100.0 / (SELECT COUNT(*) FROM exercises WHERE teacher_user_id = ${userId}) as percentage
    FROM exercises
    WHERE teacher_user_id = ${userId}
    GROUP BY difficulty
    ORDER BY COUNT(*) DESC
  `;

  // 获取最常见的问题示例
  const commonQuestionsQuery = await sql`
    SELECT 
      cr.question,
      cr.subject as category,
      COUNT(*) as frequency
    FROM chat_records cr
    JOIN students s ON cr.user_id = s.user_id
    WHERE s.teacher_user_id = ${userId}
    GROUP BY cr.question, cr.subject
    ORDER BY frequency DESC
    LIMIT 10
  `;

  // 获取练习统计
  const exerciseStatsQuery = await sql`
    SELECT 
      COUNT(*) as total_exercises,
      COUNT(CASE WHEN status = '已发布' THEN 1 END) as published_exercises,
      COUNT(CASE WHEN status = '草稿' THEN 1 END) as draft_exercises,
      COUNT(CASE WHEN deadline < CURRENT_TIMESTAMP THEN 1 END) as expired_exercises
    FROM exercises
    WHERE teacher_user_id = ${userId}
  `;

  // 获取问题长度和关键词复杂度分析
  const questionComplexityQuery = await sql`
    SELECT 
      LENGTH(cr.question) as question_length,
      cr.question,
      cr.subject as category
    FROM chat_records cr
    JOIN students s ON cr.user_id = s.user_id
    WHERE s.teacher_user_id = ${userId}
    ORDER BY question_length DESC
    LIMIT 20
  `;

  // 整合所有数据
  const analysisData = {
    students: studentsQuery.map((s) => ({
      name: s.name,
      studentId: s.student_id,
      className: s.class_name,
      questionCount: parseInt(s.question_count) || 0,
    })),
    categories: categoriesQuery.map((c) => ({
      name: c.category,
      count: parseInt(c.count) || 0,
      percentage: Math.round(parseFloat(c.percentage) || 0),
    })),
    exerciseDifficulty: exerciseDifficultyQuery.map((d) => ({
      difficulty: d.difficulty,
      count: parseInt(d.count) || 0,
      percentage: Math.round(parseFloat(d.percentage) || 0),
    })),
    commonQuestions: commonQuestionsQuery.map((q) => ({
      question: q.question,
      category: q.category,
      frequency: parseInt(q.frequency) || 0,
    })),
    exerciseStats: {
      totalExercises: parseInt(exerciseStatsQuery[0]?.total_exercises || '0'),
      publishedExercises: parseInt(exerciseStatsQuery[0]?.published_exercises || '0'),
      draftExercises: parseInt(exerciseStatsQuery[0]?.draft_exercises || '0'),
      expiredExercises: parseInt(exerciseStatsQuery[0]?.expired_exercises || '0'),
    },
    complexQuestions: questionComplexityQuery.map((q) => ({
      question: q.question,
      category: q.category,
      length: parseInt(q.question_length) || 0,
    })),
  };

  // 发送原始数据
  res.write(`data: ${JSON.stringify({ type: 'raw_data', data: analysisData })}\n\n`);

  // 构建发送给AI的prompt
  const prompt = `
你是一位经验丰富的教育顾问，正在帮助一位教师分析学生的学习情况和教学效果。请根据以下教学数据，为这位教师提供深度教学分析和建议。

## 学生基本情况
学生总数: ${analysisData.students.length}名
提问最多的学生: ${analysisData.students[0]?.name || '无'} (${analysisData.students[0]?.questionCount || 0}个问题)
班级: ${analysisData.students[0]?.className || '无'}

## 问题类别分析
${analysisData.categories
  .slice(0, 5)
  .map((c) => `- ${c.name}: ${c.count}个问题 (${c.percentage}%)`)
  .join('\n')}

## 练习难度分布
${analysisData.exerciseDifficulty.map((d) => `- ${d.difficulty}: ${d.count}个练习 (${d.percentage}%)`).join('\n')}

## 常见问题示例
${analysisData.commonQuestions
  .slice(0, 5)
  .map((q) => `- ${q.question} (${q.category}, 出现${q.frequency}次)`)
  .join('\n')}

## 练习情况
- 总练习数: ${analysisData.exerciseStats.totalExercises}
- 已发布练习: ${analysisData.exerciseStats.publishedExercises}
- 草稿练习: ${analysisData.exerciseStats.draftExercises}
- 已过期练习: ${analysisData.exerciseStats.expiredExercises}

## 复杂问题示例（按长度）
${analysisData.complexQuestions
  .slice(0, 5)
  .map((q) => `- ${q.question} (${q.category}, 长度${q.length})`)
  .join('\n')}

请提供以下几个方面的深度分析：
1. 学生学习情况总体评估
2. 教学重点与难点识别
3. 学生常见困惑和知识盲点
4. 教学策略优化建议
5. 练习设计建议
6. 个性化教学方向

请以Markdown格式回答，使用适当的标题、列表和强调语法，为教师提供有价值的教学指导。

注意事项：
1. 请确保代码块使用正确的Markdown语法：使用三个反引号(\`\`\`)开始和结束代码块
2. 代码块应当指定语言，例如：\`\`\`python
3. 所有代码块必须正确闭合，即每个开始的\`\`\`必须有一个对应的结束\`\`\`
4. 回答需要具体、有针对性，并基于数据分析
`;

  // 调用DeepSeek API的流式接口
  const stream = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content:
          '你是一位专业的教育咨询专家，擅长教学分析和教学策略优化。请以Markdown格式基于提供的数据进行深度教育分析。确保代码块格式正确，使用```语言名 和 ``` 包裹代码。注意：不要将整个回答包装在```markdown```和```之间，这会导致内容被错误地显示为代码块。',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: true,
  });

  // 处理流式响应
  let buffer = '';
  let codeBlockOpen = false;
  let isFirstChunk = true; // 用于跟踪是否是第一个块
  let hasProcessedHeader = false; // 用于跟踪是否已处理头部

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      // 如果是第一个块，检查是否以```markdown开头
      if (isFirstChunk) {
        if (
          content.trimStart().startsWith('```markdown') ||
          content.trimStart().startsWith('```')
        ) {
          // 找到第一个换行符
          const newlineIndex = content.indexOf('\n');
          if (newlineIndex !== -1) {
            // 移除```markdown直到换行
            buffer += content.substring(newlineIndex + 1);
          } else {
            // 如果没有换行符，可能整个内容都是```markdown，设置标记但不添加内容
            hasProcessedHeader = true;
          }
        } else {
          // 正常添加内容
          buffer += content;
        }
        isFirstChunk = false;
      } else {
        // 如果设置了处理头部标记但还没有处理（等待换行符）
        if (hasProcessedHeader && !buffer.length) {
          const newlineIndex = content.indexOf('\n');
          if (newlineIndex !== -1) {
            // 移除第一行直到换行
            buffer += content.substring(newlineIndex + 1);
            hasProcessedHeader = false;
          } else {
            // 仍然没有换行符，继续等待
            continue;
          }
        } else {
          // 检查是否有代码块标记
          if (content.includes('```')) {
            // 代码块处理逻辑（保持不变）
            const parts = content.split('```');

            // 拼接内容并处理代码块状态
            for (let i = 0; i < parts.length; i++) {
              if (i > 0) {
                codeBlockOpen = !codeBlockOpen; // 切换状态
                buffer += '```'; // 添加标记
              }
              buffer += parts[i];

              // 如果不是最后一部分，且当前完成了一个代码块或标识符+语言行，立即发送
              if (i < parts.length - 1 || buffer.endsWith('\n') || buffer.length > 80) {
                res.write(`data: ${JSON.stringify({ type: 'content', text: buffer })}\n\n`);
                buffer = '';
              }
            }
          } else {
            // 非代码块标记内容
            buffer += content;

            // 只有当内容包含完整的行或者达到一定长度时才发送，除非是在代码块内
            if (codeBlockOpen || content.includes('\n') || buffer.length > 80) {
              res.write(`data: ${JSON.stringify({ type: 'content', text: buffer })}\n\n`);
              buffer = '';
            }
          }
        }
      }
    }
  }

  // 发送剩余的内容，检查是否以```结尾
  if (buffer.length > 0) {
    // 检查并移除末尾的```
    if (buffer.trimEnd().endsWith('```')) {
      const lastBlockStart = buffer.lastIndexOf('```');
      if (lastBlockStart !== -1 && !buffer.substring(0, lastBlockStart).includes('```')) {
        // 只有当这是唯一的一个```时才移除
        buffer = buffer.substring(0, lastBlockStart);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'content', text: buffer })}\n\n`);
  }
}

// 处理学生深度分析
async function handleStudentAnalysis(userId: string, res: NextApiResponse) {
  // 获取学生信息
  const studentInfoQuery = await sql`
    SELECT s.*, u.username, t.username as teacher_name
    FROM students s
    JOIN users u ON s.user_id = u.id
    JOIN users t ON s.teacher_user_id = t.id
    WHERE s.user_id = ${userId}
  `;

  if (studentInfoQuery.length === 0) {
    res.write(`data: ${JSON.stringify({ error: '未找到学生信息' })}\n\n`);
    return;
  }

  const studentInfo = studentInfoQuery[0];

  // 获取问题统计
  const questionsStatsQuery = await sql`
    SELECT 
      COUNT(*) as total_questions,
      COUNT(CASE WHEN answer != '' THEN 1 END) as answered_questions,
      COUNT(DISTINCT subject) as subject_count,
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/86400 as study_days
    FROM chat_records
    WHERE user_id = ${userId}
  `;

  // 获取问题类别分析
  const categoriesQuery = await sql`
    SELECT 
      subject as category,
      COUNT(*) as count,
      COUNT(*) * 100.0 / (SELECT COUNT(*) FROM chat_records WHERE user_id = ${userId}) as percentage
    FROM chat_records
    WHERE user_id = ${userId}
    GROUP BY subject
    ORDER BY count DESC
  `;

  // 获取学生可用的练习
  const exercisesQuery = await sql`
    SELECT 
      e.*, 
      COUNT(e.*) OVER() as total_count
    FROM exercises e
    JOIN students s ON e.teacher_user_id = s.teacher_user_id
    WHERE s.user_id = ${userId} AND e.status = '已发布'
    ORDER BY e.deadline DESC
  `;

  // 获取问题分析（按问题时间统计）
  const timePatternQuery = await sql`
    SELECT 
      EXTRACT(HOUR FROM created_at) as hour,
      COUNT(*) as count
    FROM chat_records
    WHERE user_id = ${userId}
    GROUP BY hour
    ORDER BY hour
  `;

  // 获取最近问题
  const recentQuestionsQuery = await sql`
    SELECT 
      question,
      subject as category,
      to_char(created_at, 'YYYY-MM-DD HH24:MI') as time,
      LENGTH(question) as question_length
    FROM chat_records
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  // 根据问题长度分析问题复杂度
  const questionComplexityQuery = await sql`
    SELECT 
      LENGTH(question) as length,
      question,
      subject as category
    FROM chat_records
    WHERE user_id = ${userId}
    ORDER BY length DESC
    LIMIT 10
  `;

  // 整合学生分析数据
  const analysisData = {
    studentInfo: {
      name: studentInfo.name,
      studentId: studentInfo.student_id,
      className: studentInfo.class_name,
      teacherName: studentInfo.teacher_name,
    },
    questionStats: {
      totalQuestions: parseInt(questionsStatsQuery[0]?.total_questions || '0'),
      answeredQuestions: parseInt(questionsStatsQuery[0]?.answered_questions || '0'),
      subjectCount: parseInt(questionsStatsQuery[0]?.subject_count || '0'),
      studyDays: Math.round(parseFloat(questionsStatsQuery[0]?.study_days || '0')),
    },
    categories: categoriesQuery.map((c) => ({
      name: c.category,
      count: parseInt(c.count) || 0,
      percentage: Math.round(parseFloat(c.percentage) || 0),
    })),
    exercises: {
      availableCount: exercisesQuery[0]?.total_count ? parseInt(exercisesQuery[0].total_count) : 0,
      recentExercises: exercisesQuery.slice(0, 5).map((e) => ({
        title: e.title,
        difficulty: e.difficulty,
        deadline: e.deadline,
      })),
    },
    timePattern: timePatternQuery.map((t) => ({
      hour: parseInt(t.hour),
      count: parseInt(t.count),
    })),
    recentQuestions: recentQuestionsQuery.map((q) => ({
      question: q.question,
      category: q.category,
      time: q.time,
      length: parseInt(q.question_length),
    })),
    complexQuestions: questionComplexityQuery.map((q) => ({
      question: q.question,
      category: q.category,
      length: parseInt(q.length),
    })),
  };

  // 发送原始数据
  res.write(`data: ${JSON.stringify({ type: 'raw_data', data: analysisData })}\n\n`);

  // 构建学生分析的prompt
  const studentPrompt = `
你是一位专业的学习顾问，正在为一位学生提供个性化学习分析和建议。请根据以下学习数据，为这位学生提供深度学习分析和规划建议。

## 学生基本情况
姓名: ${analysisData.studentInfo.name}
学号: ${analysisData.studentInfo.studentId}
班级: ${analysisData.studentInfo.className}
指导教师: ${analysisData.studentInfo.teacherName}

## 学习统计
总提问数: ${analysisData.questionStats.totalQuestions}题
已解答问题: ${analysisData.questionStats.answeredQuestions}题 (${
    analysisData.questionStats.totalQuestions > 0
      ? Math.round(
          (analysisData.questionStats.answeredQuestions /
            analysisData.questionStats.totalQuestions) *
            100,
        )
      : 0
  }%)
涉及学科数: ${analysisData.questionStats.subjectCount}个
学习天数: ${analysisData.questionStats.studyDays}天

## 问题类别分布
${analysisData.categories
  .slice(0, 5)
  .map((c) => `- ${c.name}: ${c.count}个问题 (${c.percentage}%)`)
  .join('\n')}

## 可用练习情况
可做练习数: ${analysisData.exercises.availableCount}个
${
  analysisData.exercises.recentExercises.length > 0
    ? '最近练习:\n' +
      analysisData.exercises.recentExercises
        .map((e) => `- ${e.title} (难度:${e.difficulty}, 截止日期:${e.deadline})`)
        .join('\n')
    : '暂无最近练习'
}

## 学习时间模式
${analysisData.timePattern
  .filter((t) => t.count > 0)
  .map((t) => `- ${t.hour}点: ${t.count}个问题`)
  .join('\n')}

## 最近问题示例
${analysisData.recentQuestions
  .slice(0, 5)
  .map((q) => `- ${q.question} (${q.category}, ${q.time})`)
  .join('\n')}

## 问题复杂度分析
${analysisData.complexQuestions
  .slice(0, 5)
  .map((q) => `- ${q.question} (${q.category}, 长度${q.length})`)
  .join('\n')}

请提供以下几个方面的个性化学习分析：
1. 学习行为与习惯分析
2. 学科兴趣与专注度分析
3. 知识盲点与困惑分析
4. 学习时间管理建议
5. 针对不同问题类型的学习方法建议
6. 短期学习目标与规划建议

请以Markdown格式回答，使用适当的标题、列表和强调语法，为学生提供有实际价值的学习指导。

注意事项：
1. 请确保代码块使用正确的Markdown语法：使用三个反引号(\`\`\`)开始和结束代码块
2. 代码块应当指定语言，例如：\`\`\`python
3. 所有代码块必须正确闭合，即每个开始的\`\`\`必须有一个对应的结束\`\`\`
4. 回答需要具体、有针对性，并基于数据分析
5. 避免提及没有数据支撑的内容，如已完成练习数量或学习进度百分比等
`;

  // 调用DeepSeek API的流式接口
  const stream = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content:
          '你是一位专业的学习顾问，擅长分析学生学习行为和提供个性化学习建议。请以Markdown格式基于提供的数据进行深入分析，并提供实用的学习规划。确保代码块格式正确，使用```语言名 和 ``` 包裹代码。注意：不要将整个回答包装在```markdown```和```之间，这会导致内容被错误地显示为代码块。',
      },
      { role: 'user', content: studentPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: true,
  });

  // 处理流式响应
  let buffer = '';
  let codeBlockOpen = false;
  let isFirstChunk = true; // 用于跟踪是否是第一个块
  let hasProcessedHeader = false; // 用于跟踪是否已处理头部

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      // 如果是第一个块，检查是否以```markdown开头
      if (isFirstChunk) {
        if (
          content.trimStart().startsWith('```markdown') ||
          content.trimStart().startsWith('```')
        ) {
          // 找到第一个换行符
          const newlineIndex = content.indexOf('\n');
          if (newlineIndex !== -1) {
            // 移除```markdown直到换行
            buffer += content.substring(newlineIndex + 1);
          } else {
            // 如果没有换行符，可能整个内容都是```markdown，设置标记但不添加内容
            hasProcessedHeader = true;
          }
        } else {
          // 正常添加内容
          buffer += content;
        }
        isFirstChunk = false;
      } else {
        // 如果设置了处理头部标记但还没有处理（等待换行符）
        if (hasProcessedHeader && !buffer.length) {
          const newlineIndex = content.indexOf('\n');
          if (newlineIndex !== -1) {
            // 移除第一行直到换行
            buffer += content.substring(newlineIndex + 1);
            hasProcessedHeader = false;
          } else {
            // 仍然没有换行符，继续等待
            continue;
          }
        } else {
          // 检查是否有代码块标记
          if (content.includes('```')) {
            // 处理代码块的逻辑（保持不变）...
            const parts = content.split('```');

            // 拼接内容并处理代码块状态
            for (let i = 0; i < parts.length; i++) {
              if (i > 0) {
                codeBlockOpen = !codeBlockOpen; // 切换状态
                buffer += '```'; // 添加标记
              }
              buffer += parts[i];

              // 如果不是最后一部分，且当前完成了一个代码块或标识符+语言行，立即发送
              if (i < parts.length - 1 || buffer.endsWith('\n') || buffer.length > 80) {
                res.write(`data: ${JSON.stringify({ type: 'content', text: buffer })}\n\n`);
                buffer = '';
              }
            }
          } else {
            // 非代码块标记内容
            buffer += content;

            // 只有当内容包含完整的行或者达到一定长度时才发送，除非是在代码块内
            if (codeBlockOpen || content.includes('\n') || buffer.length > 80) {
              res.write(`data: ${JSON.stringify({ type: 'content', text: buffer })}\n\n`);
              buffer = '';
            }
          }
        }
      }
    }
  }

  // 发送剩余的内容，检查是否以```结尾
  if (buffer.length > 0) {
    // 检查并移除末尾的```
    if (buffer.trimEnd().endsWith('```')) {
      const lastBlockStart = buffer.lastIndexOf('```');
      if (lastBlockStart !== -1 && !buffer.substring(0, lastBlockStart).includes('```')) {
        // 只有当这是唯一的一个```时才移除
        buffer = buffer.substring(0, lastBlockStart);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'content', text: buffer })}\n\n`);
  }
}

import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 读取请求体
      const body = await req.json();

      // 解析嵌套的 JSON 数据
      let query, selectedImageInfo, userType;
      if (body.body) {
        const parsedBody = JSON.parse(body.body);
        query = parsedBody.query;
        selectedImageInfo = parsedBody.selectedImageInfo;
        userType = parsedBody.userType;
      } else {
        query = body.query;
        selectedImageInfo = body.selectedImageInfo;
        userType = body.userType;
      }

      if (!query || !Array.isArray(query)) {
        console.error('无效的请求数据:', { query, selectedImageInfo, userType });
        return new Response(JSON.stringify({ error: '无效的请求数据' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 使用Qdrant进行向量搜索
      const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_APIKEY,
      });

      // 获取问题的向量表示
      const embeddingResponse = await fetch(
        'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/embeddings/embedding-v1',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BAIDU_API_KEY}`,
          },
          body: JSON.stringify({
            input: [query[query.length - 1].content],
          }),
        },
      );

      if (!embeddingResponse.ok) {
        console.error('向量化请求失败:', await embeddingResponse.text());
        throw new Error('向量化请求失败');
      }

      const embeddingData = await embeddingResponse.json();
      const queryVector = embeddingData.data[0].embedding;

      // 在Qdrant中搜索相似内容
      let collectionName = 'jsjwl'; // 默认使用计算机网络集合

      switch (selectedImageInfo) {
        case '需求工程':
          collectionName = 'xqgc';
          break;
        case '操作系统':
          collectionName = 'czxt';
          break;
        case '计算机网络':
          collectionName = 'jsjwl';
          break;
      }

      const searchResult = await client.search(collectionName, {
        vector: queryVector,
        limit: 3,
      });

      // 判断得分是否满足要求
      const lowScoreResults = searchResult.filter((result) => result.score < 0.5);

      let chatData; // 在外部定义chatData
      if (lowScoreResults.length > 0) {
        // 直接让AI处理用户信息
        chatData = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的${userType === 'teacher' ? '教师' : '学生'}助手。当前正在讨论${selectedImageInfo}相关的内容。

请遵循以下原则：
1. 如果用户的问题与${selectedImageInfo}无关（如问候、闲聊、询问天气等），请先给出简短友好的回应
2. 然后自然地引导用户回到${selectedImageInfo}的主题，例如：
   - 对于问候："你好！很高兴见到你。让我们继续讨论${selectedImageInfo}相关的问题吧，你有什么想了解的吗？"
   - 对于闲聊："这个问题很有趣。不过我们现在正在学习${selectedImageInfo}，你想了解这方面的什么内容呢？"
   - 对于无关问题："这个问题可能超出了${selectedImageInfo}的范围。让我们先专注于${selectedImageInfo}的学习，你有什么具体的问题吗？"

请确保回答：
- 保持友好和自然
- 不要生硬地打断用户
- 巧妙地引导回主题
- 鼓励用户提出与${selectedImageInfo}相关的问题`,
            },
            {
              role: 'user',
              content: query[query.length - 1].content,
            },
          ],
          temperature: 1,
          max_tokens: 888,
          stream: true,
        });
      } else {
        // 提取相关内容
        const contents = searchResult.map((result) => result.payload.content);

        // 使用DeepSeek生成回答
        chatData = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的${userType === 'teacher' ? '教师' : '学生'}助手。

问题：${query[query.length - 1].content}

请根据以下要求回答问题：

1. 首先判断上述问题是否与${selectedImageInfo}相关：
   - 如果是简单的问候（如"你好"、"早上好"等）、闲聊、询问天气、发送无意义字符或与${selectedImageInfo}完全无关的问题，请直接给出简短友好的回应，不需要进入后续步骤
   - 如果是与${selectedImageInfo}相关的问题，请继续下面的步骤

2. 对于${selectedImageInfo}相关的问题：
   - 使用 Markdown 格式组织回答内容
   - 根据用户类型（${userType === 'teacher' ? '教师' : '学生'}）提供针对性的建议
   - 回答要包含：
     * 核心概念解释（如果问题涉及具体概念）
     * 具体示例（如果问题适合用示例说明）
     * 常见误区（如果问题涉及容易混淆的知识点）
     * 学习建议（如果问题涉及学习方法）
     * 参考资料链接（如果有相关资源）

3. 回答原则：
   - 对于无关问题，直接给出简短回应，不要尝试将其与${selectedImageInfo}关联
   - 保持专业性和准确性
   - 语言要${userType === 'teacher' ? '专业且深入' : '通俗易懂'}
   - 根据问题的具体内容决定回答的深度和广度
   - 不要生搬硬套格式，根据问题特点灵活调整回答结构
   - 相关知识点仅供参考，如果发现知识点不准确或无关，请忽略它们，直接基于你的专业知识回答

请确保回答既准确又易于理解，能够帮助${userType === 'teacher' ? '教师更好地教学' : '学生更好地掌握知识点'}。`,
            },
            {
              role: 'user',
              content: `以下是一些可能相关的知识点（仅供参考）：
${contents.map((content, index) => `${index + 1}. ${content}`).join('\n')}

请基于以上问题，结合你的专业知识给出一个详细且全面的回答。如果发现上述知识点不准确或无关，请直接忽略它们。`,
            },
          ],
          temperature: 1,
          max_tokens: 888,
          stream: true,
        });
      }

      // 设置响应头
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of chatData) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
            controller.close();
          } catch (error) {
            console.error('流式响应错误:', error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (error) {
      console.error('处理请求时发生错误:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

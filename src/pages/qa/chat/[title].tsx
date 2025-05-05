import {
  CopyOutlined,
  DislikeOutlined,
  FormOutlined,
  LikeOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Bubble, Sender, Welcome, useXAgent, useXChat } from '@ant-design/x';
import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList';
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Rate,
  Select,
  Space,
  Spin,
  Typography,
  message,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism/index.js';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import Transition from '../../Transition';
import { imageInfoList } from '../index';

const { Title, Text } = Typography;

// 定义笔记接口
interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  subject: string;
  createTime: string;
}

// 定义聊天记录的接口
interface ChatRecord {
  id: number;
  record_id: string;
  subject: string;
  question: string;
  answer: string;
  created_at: string;
  user_id: number;
  feedback_type?: string;
  feedback_rating?: number;
  feedback_content?: string;
}

// 扩展BubbleDataType类型，添加feedback属性
interface ExtendedBubbleData extends BubbleDataType {
  feedback?: {
    type: string;
    rating: number;
    content: string;
  };
}

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      height: 94vh;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
      margin: 0 auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 12px;
    `,
    chatList: css`
      flex: 1;
      overflow: auto;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
    `,
    loadingMessage: css`
      background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    `,
    placeholder: css`
      padding-top: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
    `,
    sender: css`
      width: 100%;
      padding: 0 16px;
    `,
    speechButton: css`
      font-size: 18px;
      color: ${token.colorText} !important;
    `,
    senderPrompt: css`
      width: 100%;
      color: ${token.colorText};
    `,
    headerCard: css`
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      margin-bottom: 12px;
    `,
    userAvatar: css`
      color: #fff;
      background-color: #1677ff;
    `,
    aiAvatar: css`
      color: #fff;
      background-color: #52c41a;
    `,
    message: css`
      max-width: 800px;
      word-break: break-word;
      padding: 12px 16px;
      background: ${token.colorBgContainer};
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    `,
    aiMessage: css`
      padding: 0px 16px;
    `,
    messageContainer: css`
      max-width: 800px;
      width: 100%;
      margin: 0px 0;
    `,
    markdown: css`
      pre {
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 0;
      }
      code {
        padding: 2px 4px;
        border-radius: 4px;
        font-family: ${token.fontFamilyCode};
      }
      blockquote {
        border-left: 4px solid ${token.colorPrimary};
        margin: 0;
        padding: 0 16px;
        color: ${token.colorTextSecondary};
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }
      th,
      td {
        border: 1px solid ${token.colorBorder};
        padding: 8px;
      }
      th {
        background-color: ${token.colorBgContainer};
      }
    `,
    historyItem: css`
      padding: 12px;
      border-bottom: 1px solid ${token.colorBorder};
      cursor: pointer;
      &:hover {
        background-color: ${token.colorBgContainer};
      }
    `,
    floatButton: css`
      position: fixed;
      right: 50px;
      bottom: 88px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: ${token.colorPrimary};
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: all 0.3s;
      &:hover {
        transform: scale(1.1);
      }
    `,
  };
});

const ChatPage: React.FC = () => {
  const { styles } = useStyle();
  const params = useParams();
  const router = useRouter();
  const abortController = useRef<AbortController | null>(null);
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const { token } = theme.useToken();

  // ==================== State ====================
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike'>('like');
  const [fullAnswer, setFullAnswer] = useState('');
  const [lastRecordId, setLastRecordId] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  // 添加笔记相关状态
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteForm] = Form.useForm();

  // ==================== Runtime ====================
  const [agent] = useXAgent<ExtendedBubbleData>({
    baseURL: '/api/query',
    model: 'default',
  });
  const loading = agent.isRequesting();

  // 保存聊天记录到数据库
  const saveMessageToDatabase = async (question: string, answer: string) => {
    try {
      if (!session?.user?.id || !params?.title) {
        return;
      }

      const recordId = uuidv4();
      setLastRecordId(recordId);

      const response = await fetch('/api/chat/save-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          recordId: recordId,
          subject: params.title,
          question: question,
          answer: answer,
        }),
      });

      if (response.ok) {
        // 更新当前消息的ID以便后续反馈
        const updatedMessages = messages.map((msg, index) => {
          if (index === messages.length - 1 && msg.message.role === 'assistant') {
            return {
              ...msg,
              message: {
                ...msg.message,
                id: recordId,
              },
            };
          }
          return msg;
        });

        setMessages(updatedMessages as any);
      } else {
        console.error('保存聊天记录失败');
      }
    } catch (error) {
      console.error('保存聊天记录时出错:', error);
    }
  };

  const { onRequest, messages, setMessages } = useXChat<ExtendedBubbleData>({
    agent,
    requestFallback: (_, { error }) => {
      if (error.name === 'AbortError') {
        return {
          content: '已取消生成',
          role: 'assistant',
        };
      }
      return {
        content: '请求失败，请重试！',
        role: 'assistant',
      };
    },
    transformMessage: (info) => {
      const { originMessage, chunk } = info || {};
      let currentText = '';
      try {
        if (chunk?.data) {
          const message = JSON.parse(chunk?.data);
          currentText = message?.content || '';

          // 累积收到的回答
          if (currentText) {
            setFullAnswer((prev) => prev + currentText);
          }
        }
      } catch (error) {
        console.error('解析消息错误:', error);
      }
      return {
        content: (originMessage?.content || '') + currentText,
        role: 'assistant',
      };
    },
    resolveAbortController: (controller) => {
      abortController.current = controller;
    },
  });

  // 获取历史聊天记录
  const fetchChatHistory = async () => {
    if (!session?.user?.id || !params?.title) {
      setInitializing(false);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch(
        `/api/chat/get-history?userId=${session.user.id}&subject=${params.title}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.data || []);

        // 如果有历史记录并且当前没有消息，则自动加载最近的一条聊天记录
        if (data.data?.length > 0 && messages.length === 0 && initializing) {
          convertHistoryToMessages(data.data);
        }
      } else {
        message.error('获取历史记录失败');
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
      message.error('获取历史记录失败');
    } finally {
      setHistoryLoading(false);
      setInitializing(false);
    }
  };

  // 将历史记录转换为消息格式并显示在聊天框中
  const convertHistoryToMessages = (records: ChatRecord[]) => {
    if (!records || records.length === 0) return;

    // 按时间排序，确保按照对话顺序显示
    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    // 将所有历史记录转换为消息格式
    const historyMessages = sortedRecords.flatMap((record) => [
      {
        status: 'done',
        message: {
          id: `${record.record_id}-q`,
          role: 'user',
          content: record.question,
        } as ExtendedBubbleData,
      },
      {
        status: 'done',
        message: {
          id: record.record_id,
          role: 'assistant',
          content: record.answer,
          feedback: record.feedback_type
            ? {
                type: record.feedback_type,
                rating: record.feedback_rating || 0,
                content: record.feedback_content || '',
              }
            : undefined,
        } as ExtendedBubbleData,
      },
    ]);

    // 设置消息
    setMessages(historyMessages as any);
  };

  // 加载选中的历史聊天记录
  const loadChatHistory = (record: ChatRecord) => {
    // 创建一个包含历史问答的消息数组
    const historyMessages = [
      {
        status: 'done',
        message: {
          id: `${record.record_id}-q`,
          role: 'user',
          content: record.question,
        } as ExtendedBubbleData,
      },
      {
        status: 'done',
        message: {
          id: record.record_id,
          role: 'assistant',
          content: record.answer,
          feedback: record.feedback_type
            ? {
                type: record.feedback_type,
                rating: record.feedback_rating || 0,
                content: record.feedback_content || '',
              }
            : undefined,
        } as ExtendedBubbleData,
      },
    ];

    // 设置消息
    setMessages(historyMessages as any);
    setHistoryVisible(false); // 关闭历史记录抽屉
  };

  // 监听消息完成事件
  useEffect(() => {
    // 当没有正在加载的消息且有完整回答时，保存到数据库
    const loadingMessage = messages.find((msg) => msg.status === 'loading');
    if (!loadingMessage && fullAnswer && messages.length > 0) {
      // 查找最后一个用户消息（最新的用户问题）
      let lastUserMessageIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].message.role === 'user') {
          lastUserMessageIndex = i;
          break;
        }
      }

      // 如果找到用户消息
      if (lastUserMessageIndex !== -1) {
        const lastUserMessage = messages[lastUserMessageIndex].message.content;

        // 确保问题和回答都是字符串类型
        const questionStr = String(lastUserMessage || '');
        const answerStr = String(fullAnswer);

        saveMessageToDatabase(questionStr, answerStr);
        setFullAnswer(''); // 保存后清空
      }
    }
  }, [loading, fullAnswer, messages]);

  // 当组件加载时，获取历史记录
  useEffect(() => {
    if (session?.user?.id && params?.title) {
      fetchChatHistory();
    }
  }, [session, params]);

  if (!params?.title) {
    return null;
  }

  const selectedImageInfo = imageInfoList.find((imageInfo) => imageInfo.title === params.title);

  const userAvatarStyle: React.CSSProperties = {
    color: '#fff',
    backgroundColor: '#1677ff',
  };

  const aiAvatarStyle: React.CSSProperties = {
    color: '#fff',
    backgroundColor: '#52c41a',
  };

  // 获取用户头像
  const getUserAvatar = () => {
    const avatarUrl = localStorage.getItem('avatarUrl');
    if (avatarUrl) {
      return { src: avatarUrl };
    }
    return { icon: <UserOutlined />, style: userAvatarStyle };
  };

  // ==================== Event ====================
  const handleAbort = () => {
    if (abortController.current) {
      abortController.current.abort();
      setTimeout(() => {
        const updatedMessages = messages.map((msg) => {
          if (msg.status === 'loading') {
            return {
              ...msg,
              status: 'done',
              message: {
                ...msg.message,
                content: msg.message.content || '已中止生成',
              },
            };
          }
          return msg;
        });
        setMessages(updatedMessages as any);
      }, 100);
    }
  };

  const onSubmit = (val: string) => {
    if (!val) return;

    if (loading) {
      return;
    }

    onRequest({
      stream: true,
      message: { role: 'user', content: val },
      body: JSON.stringify({
        query: [...messages, { role: 'user', content: val }],
        selectedImageInfo: selectedImageInfo.title,
        userType: session?.user?.type || 'student',
      }),
    });
  };

  // 处理反馈
  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setCurrentMessageId(messageId);
    setFeedbackType(type);
    setFeedbackModalVisible(true);
  };

  // 提交反馈
  const handleFeedbackSubmit = async (values: any) => {
    try {
      // 发送反馈到后端
      const response = await fetch('/api/feedback/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: currentMessageId,
          type: feedbackType,
          rating: values.rating,
          content: values.content,
          userId: session?.user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('提交反馈失败');
      }

      // 更新本地状态，为当前消息添加反馈信息
      const updatedMessages = messages.map((msg) => {
        if (msg.message.id === currentMessageId) {
          return {
            ...msg,
            message: {
              ...msg.message,
              feedback: {
                type: feedbackType,
                rating: values.rating,
                content: values.content,
              },
            } as ExtendedBubbleData,
          };
        }
        return msg;
      });

      setMessages(updatedMessages as any);

      // 更新历史记录中的反馈信息
      setChatHistory((prevHistory) =>
        prevHistory.map((record) =>
          record.record_id === currentMessageId
            ? {
                ...record,
                feedback_type: feedbackType,
                feedback_rating: values.rating,
                feedback_content: values.content,
              }
            : record,
        ),
      );

      message.success('感谢您的反馈！');
      setFeedbackModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('提交反馈失败，请重试');
    }
  };

  // 撤销反馈
  const handleResetFeedback = async (messageId: string) => {
    try {
      const response = await fetch('/api/feedback/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: messageId,
        }),
      });

      if (!response.ok) {
        throw new Error('撤销反馈失败');
      }

      // 更新本地状态，移除当前消息的反馈信息
      const updatedMessages = messages.map((msg) => {
        if (msg.message.id === messageId) {
          const { feedback, ...restMessage } = msg.message as ExtendedBubbleData;
          return {
            ...msg,
            message: restMessage as ExtendedBubbleData,
          };
        }
        return msg;
      });

      setMessages(updatedMessages as any);

      // 更新历史记录中的反馈信息
      setChatHistory((prevHistory) =>
        prevHistory.map((record) =>
          record.record_id === messageId
            ? {
                ...record,
                feedback_type: undefined,
                feedback_rating: undefined,
                feedback_content: undefined,
              }
            : record,
        ),
      );

      message.success('已撤销反馈');
    } catch (error) {
      message.error('撤销反馈失败，请重试');
    }
  };

  // 保存笔记到本地存储
  const handleSaveNote = (values: any) => {
    try {
      // 从本地存储获取现有笔记
      const existingNotes = localStorage.getItem('chat_notes');
      const notes: Note[] = existingNotes ? JSON.parse(existingNotes) : [];

      // 创建新笔记
      const newNote: Note = {
        id: Date.now().toString(),
        title: values.title || '无标题',
        content: values.content || '',
        category: values.category || '其他',
        subject: values.subject || (params.title as string),
        createTime: new Date().toLocaleString(),
      };

      // 添加新笔记并保存到本地存储
      const newDataSource = [...notes, newNote];
      localStorage.setItem('chat_notes', JSON.stringify(newDataSource));

      message.success('笔记保存成功！');
      setNoteModalVisible(false);
      noteForm.resetFields();
    } catch (error) {
      console.error('保存笔记失败:', error);
      message.error('保存笔记失败');
    }
  };

  // ==================== Nodes ====================
  const chatList = (
    <div className={styles.chatList}>
      {messages?.length ? (
        <Bubble.List
          items={messages?.map((i) => {
            // 将当前消息转换为 ExtendedBubbleData 类型以便访问 feedback 属性
            const msgData = i.message as ExtendedBubbleData;
            const isAssistant = i.message.role === 'assistant';
            const isLoading = i.status === 'loading';

            // 自定义footer, 仅在非加载状态的助手消息上显示
            const footerNode =
              isAssistant && !isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                  {/* 复制按钮 */}
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(String(msgData.content || ''));
                      message.success('已复制到剪贴板');
                    }}
                  />

                  {/* 点赞按钮 */}
                  <Button
                    type="text"
                    size="small"
                    icon={<LikeOutlined />}
                    style={
                      msgData.feedback?.type === 'like'
                        ? {
                            color: token.colorPrimary,
                            backgroundColor: token.colorPrimaryBg,
                          }
                        : undefined
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (msgData.feedback?.type === 'like') {
                        handleResetFeedback(msgData.id as string);
                      } else {
                        setCurrentMessageId(msgData.id as string);
                        setFeedbackType('like');
                        setFeedbackModalVisible(true);
                      }
                    }}
                  />

                  {/* 点踩按钮 */}
                  <Button
                    type="text"
                    size="small"
                    icon={<DislikeOutlined />}
                    style={
                      msgData.feedback?.type === 'dislike'
                        ? {
                            color: token.colorError,
                            backgroundColor: token.colorErrorBg,
                          }
                        : undefined
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (msgData.feedback?.type === 'dislike') {
                        handleResetFeedback(msgData.id as string);
                      } else {
                        setCurrentMessageId(msgData.id as string);
                        setFeedbackType('dislike');
                        setFeedbackModalVisible(true);
                      }
                    }}
                  />
                </div>
              ) : undefined;

            return {
              ...i.message,
              classNames: {
                content: isLoading
                  ? styles.loadingMessage
                  : isAssistant
                    ? `${styles.message} ${styles.aiMessage}`
                    : styles.message,
                footer: 'bubble-footer', // 添加类名确保正确渲染
              },
              styles: {
                content: { maxWidth: '800px' },
                footer: { marginTop: '8px', width: '100%' }, // 确保footer显示
              },
              typing: isLoading
                ? { step: 5, interval: 20, suffix: <>💗</>, children: null }
                : false,
              avatar: isAssistant
                ? { icon: <RobotOutlined />, style: aiAvatarStyle }
                : getUserAvatar(),
              content: isAssistant ? (
                <div className={styles.markdown} style={{ margin: '-14px 0' }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                            customStyle={{ margin: 0 }}
                            children={[String(children).replace(/\n$/, '')]}
                          />
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {i.message?.content || ''}
                  </ReactMarkdown>
                </div>
              ) : (
                i.message?.content || ''
              ),
              footer: footerNode,
            };
          })}
          style={{ height: '100%', paddingInline: '4em' }}
          roles={{
            assistant: {
              placement: 'start',
              loadingRender: () => <Spin size="small" />,
            },
            user: { placement: 'end' },
          }}
        />
      ) : (
        <Space
          direction="vertical"
          size={16}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
          className={styles.placeholder}
        >
          {initializing ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
              }}
            >
              <Spin size="large" />
              <div style={{ marginTop: '20px', fontSize: '16px' }}>正在加载历史对话...</div>
            </div>
          ) : (
            <Welcome
              variant="borderless"
              icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
              title={`欢迎使用帮你读，你将要查询的科目是 ${selectedImageInfo.title}`}
              description="请输入需要查询的内容，我会尽力为您解答。"
            />
          )}
        </Space>
      )}
    </div>
  );

  const senderHeader = (
    <Sender.Header
      title="上传文件"
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      styles={{ content: { padding: 0 } }}
    ></Sender.Header>
  );

  const chatSender = (
    <>
      <Sender
        value={inputValue}
        header={senderHeader}
        onSubmit={() => {
          onSubmit(inputValue);
          setInputValue('');
        }}
        onChange={setInputValue}
        onCancel={handleAbort}
        loading={loading}
        className={styles.sender}
        allowSpeech
        actions={(_, info) => {
          const { SendButton, LoadingButton, SpeechButton } = info.components;
          return (
            <Flex
              gap={4}
              children={
                <>
                  <SpeechButton className={styles.speechButton} />
                  {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                </>
              }
            />
          );
        }}
        placeholder="请输入您的问题"
      />
    </>
  );

  // 在顶部卡片中只保留重新选择科目按钮
  const headerActions = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={4} style={{ margin: 0 }}>
        科目：{selectedImageInfo.title}
      </Title>
      <Button
        type="primary"
        ghost
        onClick={() => router.push('/qa')}
        style={{ borderRadius: '6px' }}
      >
        重新选择科目
      </Button>
    </div>
  );

  // 添加一个错误处理状态
  const [hasError, setHasError] = useState(false);

  // 使用useEffect监听错误并尝试自动恢复
  useEffect(() => {
    const handleError = () => {
      setHasError(true);
      // 5秒后自动尝试恢复
      setTimeout(() => {
        setHasError(false);
      }, 5000);
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // 如果有错误，显示错误信息
  if (hasError) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>页面加载出错</h2>
        <p>正在尝试恢复，请稍候...</p>
        <Button
          type="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px' }}
        >
          刷新页面
        </Button>
      </div>
    );
  }

  return (
    <Transition
      children={
        <div className={styles.layout}>
          <div className={styles.chat}>
            <Card className={styles.headerCard} bodyStyle={{ padding: '8px 16px' }}>
              {headerActions}
            </Card>
            {chatList}
            {chatSender}
            <Modal
              title={feedbackType === 'like' ? '点赞反馈' : '点踩反馈'}
              open={feedbackModalVisible}
              onCancel={() => {
                setFeedbackModalVisible(false);
                form.resetFields();
              }}
              footer={null}
            >
              <Form form={form} onFinish={handleFeedbackSubmit} layout="vertical">
                <Form.Item
                  name="rating"
                  label="评分"
                  rules={[{ required: true, message: '请给出评分' }]}
                >
                  <Rate />
                </Form.Item>
                <Form.Item
                  name="content"
                  label="详细反馈"
                  rules={[{ required: true, message: '请填写详细反馈' }]}
                >
                  <Input.TextArea rows={4} placeholder="请详细描述您的反馈意见..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    提交反馈
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            {/* 笔记悬浮按钮 */}
            <div
              className={styles.floatButton}
              onClick={() => {
                setNoteModalVisible(true);
                noteForm.resetFields();
                noteForm.setFieldsValue({
                  subject: params.title,
                });
              }}
            >
              <FormOutlined style={{ fontSize: 24 }} />
            </div>

            {/* 笔记表单弹窗 */}
            <Modal
              title="添加笔记"
              open={noteModalVisible}
              onCancel={() => {
                setNoteModalVisible(false);
                noteForm.resetFields();
              }}
              footer={null}
              width={700}
            >
              <Form form={noteForm} layout="vertical" onFinish={handleSaveNote}>
                <Form.Item name="title" label="标题">
                  <Input placeholder="请输入笔记标题" />
                </Form.Item>

                <Form.Item name="subject" label="科目">
                  <Select
                    placeholder="请选择科目"
                    options={[
                      { value: '需求工程', label: '需求工程' },
                      { value: '操作系统', label: '操作系统' },
                      { value: '计算机网络', label: '计算机网络' },
                    ]}
                    defaultValue={params.title}
                    allowClear
                  />
                </Form.Item>

                <Form.Item name="category" label="分类">
                  <Select
                    placeholder="请选择分类"
                    options={[
                      { value: '知识点', label: '知识点' },
                      { value: '重点难点', label: '重点难点' },
                      { value: '考试重点', label: '考试重点' },
                      { value: '其他', label: '其他' },
                    ]}
                    allowClear
                  />
                </Form.Item>

                <Form.Item name="content" label="内容">
                  <Input.TextArea rows={8} placeholder="请输入笔记内容" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    保存笔记
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      }
    />
  );
};

export default ChatPage;

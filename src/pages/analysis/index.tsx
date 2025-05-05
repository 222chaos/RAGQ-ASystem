import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  FileOutlined,
  FileTextOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, List, Row, Spin, Statistic, Table } from 'antd';
// @ts-ignore
import { theme } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism/index.js';
import remarkGfm from 'remark-gfm';
import styles from './index.module.css';

interface BaseStats {
  totalQuestions: number;
  answeredQuestions: number;
  recentQuestions: Array<{
    question: string;
    status: string;
    time: string;
    category: string;
  }>;
  categoryStats: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  exerciseStats: {
    totalExercises: number;
    publishedExercises: number;
    draftExercises: number;
    expiredExercises: number;
    completedExercises: number;
    overdueExercises: number;
  };
  exerciseDifficulty: Array<{
    difficulty: string;
    count: number;
    percentage: number;
  }>;
  analysisSuggestions: {
    questionPatterns: Array<{
      category: string;
      pattern: string;
      count: number;
      percentage: number;
    }>;
  };
}

interface TeacherData extends BaseStats {
  teacherStats: {
    totalStudents: number;
    activeStudents: number;
    avgScore: number;
    classSatisfaction: number;
  };
  analysisSuggestions: BaseStats['analysisSuggestions'] & {
    teachingSuggestions: string[];
  };
  deepAnalysis?: string;
}

interface StudentData extends BaseStats {
  studentStats: {
    totalStudySessions: number;
    studiedSubjects: number;
    completedExercises: number;
    studyProgress: number;
  };
  analysisSuggestions: BaseStats['analysisSuggestions'] & {
    learningSuggestions: string[];
    questionAnalysis: Array<{
      type: string;
      count: number;
      percentage: number;
      examples: string[];
    }>;
  };
  deepAnalysis?: string;
}

// 添加流式分析接口
interface StreamAnalysisData {
  type: 'content' | 'raw_data';
  text?: string;
  data?: any;
  error?: string;
  message?: string;
  details?: string;
}

// 简化全局状态管理器，移除复杂的重连逻辑
const globalState = {
  teacherAnalysisContent: '',
  studentAnalysisContent: '',
};

// 创建一个公共的Markdown渲染组件，使用与聊天页面相同的样式
const MarkdownRenderer = ({ content }: { content: string }) => {
  // 预处理Markdown内容，确保代码块正确格式化
  const processedContent = React.useMemo(() => {
    if (!content) return '';

    // 处理未完成的代码块
    let processedText = content;

    // 计算代码块的开始和结束标记数量
    const openingCodeBlocks = (processedText.match(/```(?!.*```)/g) || []).length;

    // 如果有未闭合的代码块，添加闭合标记
    if (openingCodeBlocks % 2 !== 0) {
      processedText += '\n```';
    }

    // 移除可能的空pre标签
    processedText = processedText.replace(/```\s*```/g, '');

    return processedText;
  }, [content]);

  // 使用主题上下文获取当前主题颜色
  const { token } = theme.useToken();

  return (
    <div className={styles.markdown}>
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
                customStyle={{
                  margin: '0',
                  backgroundColor:
                    token.colorBgContainer === '#ffffff' ? '#1e1e1e' : token.colorBgContainer,
                }}
                children={String(children).replace(/\n$/, '')}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

// 本地存储相关的常量和会话存储
const STORAGE_KEY = {
  TEACHER_ANALYSIS: 'teacher_deep_analysis',
  STUDENT_ANALYSIS: 'student_deep_analysis',
};

// 使用会话存储保存分析结果
let sessionStorage = {
  teacherAnalysis: '',
  studentAnalysis: '',
};

const TeacherView: React.FC<{ data: TeacherData }> = ({ data }) => {
  const [deepAnalysis, setDeepAnalysis] = useState<string>('');
  const [rawAnalysisData, setRawAnalysisData] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const analysisStreamRef = useRef<EventSource | null>(null);
  const { data: session } = useSession();
  const { token } = theme.useToken();

  // 从会话存储初始化
  useEffect(() => {
    // 首先从会话存储或全局状态加载内容
    if (globalState.teacherAnalysisContent) {
      setDeepAnalysis(globalState.teacherAnalysisContent);
      if (globalState.teacherAnalysisContent.length > 0) {
        setShowAnalysis(true);
      }
    } else if (sessionStorage.teacherAnalysis) {
      setDeepAnalysis(sessionStorage.teacherAnalysis);
      if (sessionStorage.teacherAnalysis.length > 0) {
        setShowAnalysis(true);
      }
    } else if (session?.user?.id) {
      // 如果会话存储为空，则尝试从localStorage加载
      try {
        const storedData = localStorage.getItem(STORAGE_KEY.TEACHER_ANALYSIS);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.userId === session.user.id && parsedData.analysis) {
            setDeepAnalysis(parsedData.analysis);
            sessionStorage.teacherAnalysis = parsedData.analysis;
            globalState.teacherAnalysisContent = parsedData.analysis;
            // 不立即显示，等用户点击按钮
          }
        }
      } catch (e) {
        console.error('解析存储的分析数据错误:', e);
      }
    }

    // 组件卸载时的清理 - 立即关闭连接
    return () => {
      if (analysisStreamRef.current) {
        // 立即关闭连接，不保持状态
        analysisStreamRef.current.close();
        analysisStreamRef.current = null;

        // 保存已生成的内容
        globalState.teacherAnalysisContent = deepAnalysis;

        // 如果正在加载，显示提示给用户
        if (loadingAnalysis) {
          setLoadingAnalysis(false);
          alert('页面切换，分析已停止。请返回后重新获取分析。');
        }
      }
    };
  }, [session]);

  // 修改setupEventHandlers函数，简化错误处理
  const setupEventHandlers = (eventSource: EventSource) => {
    eventSource.onmessage = (event) => {
      try {
        const data: StreamAnalysisData = JSON.parse(event.data);

        if (data.error) {
          console.error('分析错误:', data.error);
          setLoadingAnalysis(false);
          eventSource.close();
          return;
        }

        if (data.message === 'analysis_complete') {
          setLoadingAnalysis(false);
          eventSource.close();
          setShowAnalysis(true);

          // 在存储前处理内容，确保没有未闭合的代码块
          setDeepAnalysis((prev) => {
            // 检查是否有未闭合的代码块
            const codeBlockCount = (prev.match(/```/g) || []).length;
            let finalContent = prev;
            if (codeBlockCount % 2 !== 0) {
              finalContent += '\n```';
            }

            // 移除可能的空pre标签
            finalContent = finalContent.replace(/```\s*```/g, '');

            // 存储最终版本
            if (session?.user?.id) {
              const storageData = {
                userId: session.user.id,
                analysis: finalContent,
                timestamp: new Date().toISOString(),
              };
              localStorage.setItem(STORAGE_KEY.TEACHER_ANALYSIS, JSON.stringify(storageData));
              sessionStorage.teacherAnalysis = finalContent;
              globalState.teacherAnalysisContent = finalContent;
            }

            return finalContent;
          });

          return;
        }

        if (data.type === 'content' && data.text) {
          setDeepAnalysis((prev) => {
            const newContent = prev + data.text;

            // 更新全局状态
            globalState.teacherAnalysisContent = newContent;
            sessionStorage.teacherAnalysis = newContent;

            // 一旦有内容开始生成，立即显示分析部分
            if (!showAnalysis && newContent.length > 0) {
              setShowAnalysis(true);
            }
            return newContent;
          });
        }

        if (data.type === 'raw_data' && data.data) {
          setRawAnalysisData(data.data);
        }
      } catch (e) {
        console.error('解析SSE数据错误:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE错误:', error);
      setLoadingAnalysis(false);
      eventSource.close();
    };
  };

  const fetchDeepAnalysis = async (forceRefresh = false) => {
    // 如果已经有内容且不是强制刷新，则直接显示
    if (deepAnalysis && !forceRefresh) {
      setShowAnalysis(true);
      return;
    }

    try {
      setLoadingAnalysis(true);
      // 不再隐藏分析部分，使生成内容能够立即显示
      setDeepAnalysis('');
      sessionStorage.teacherAnalysis = '';
      globalState.teacherAnalysisContent = '';

      // 关闭之前的连接
      if (analysisStreamRef.current) {
        analysisStreamRef.current.close();
        analysisStreamRef.current = null;
      }

      // 创建SSE连接
      const eventSource = new EventSource('/api/analysis/deep-analysis');
      analysisStreamRef.current = eventSource;

      // 设置事件处理器
      setupEventHandlers(eventSource);
    } catch (error) {
      console.error('获取深度分析失败:', error);
      setLoadingAnalysis(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="总提问数" value={data.totalQuestions} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已回答问题"
              value={data.answeredQuestions}
              prefix={<CheckCircleOutlined />}
              suffix={
                data.totalQuestions > 0
                  ? `(${Math.round((data.answeredQuestions / data.totalQuestions) * 100)}%)`
                  : ''
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="创建的练习总数"
              value={data.exerciseStats.totalExercises}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前进行中练习"
              value={data.exerciseStats.publishedExercises - data.exerciseStats.expiredExercises}
              prefix={<FileDoneOutlined />}
              suffix={
                data.exerciseStats.totalExercises > 0
                  ? `(${Math.round(((data.exerciseStats.publishedExercises - data.exerciseStats.expiredExercises) / data.exerciseStats.totalExercises) * 100)}%)`
                  : ''
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="学生总数"
              value={data.teacherStats.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="近30天活跃学生"
              value={data.teacherStats.activeStudents}
              prefix={<UserOutlined />}
              suffix={
                data.teacherStats.totalStudents > 0
                  ? `(${Math.round((data.teacherStats.activeStudents / data.teacherStats.totalStudents) * 100)}%)`
                  : ''
              }
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="草稿练习"
              value={data.exerciseStats.draftExercises}
              prefix={<FileTextOutlined />}
              suffix={
                data.exerciseStats.totalExercises > 0
                  ? `(${Math.round((data.exerciseStats.draftExercises / data.exerciseStats.totalExercises) * 100)}%)`
                  : ''
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="问题分类统计">
            <ReactECharts
              option={{
                tooltip: {
                  trigger: 'item',
                  formatter: '{a} <br/>{b}: {c} ({d}%)',
                },
                legend: {
                  orient: 'vertical',
                  left: 10,
                  data: data.categoryStats.map((item) => item.name),
                },
                series: [
                  {
                    name: '问题分类',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                      show: false,
                      position: 'center',
                    },
                    emphasis: {
                      label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold',
                      },
                    },
                    labelLine: {
                      show: false,
                    },
                    data: data.categoryStats.map((item) => ({
                      value: item.count,
                      name: item.name,
                    })),
                  },
                ],
              }}
              style={{ height: '300px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="练习难度分布">
            <ReactECharts
              option={{
                tooltip: {
                  trigger: 'item',
                  formatter: '{a} <br/>{b}: {c} ({d}%)',
                },
                legend: {
                  orient: 'vertical',
                  left: 10,
                  data: data.exerciseDifficulty.map((item) => item.difficulty),
                },
                series: [
                  {
                    name: '难度分布',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                      show: false,
                      position: 'center',
                    },
                    emphasis: {
                      label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold',
                      },
                    },
                    labelLine: {
                      show: false,
                    },
                    data: data.exerciseDifficulty.map((item) => ({
                      value: item.count,
                      name: item.difficulty,
                    })),
                  },
                ],
              }}
              style={{ height: '300px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="教学建议">
            <List
              size="small"
              dataSource={data.analysisSuggestions.teachingSuggestions}
              renderItem={(item: string) => (
                <List.Item>
                  <Badge status="processing" text={String(item)} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近问题">
            <Table
              dataSource={data.recentQuestions.map((q, index) => ({ ...q, key: index }))}
              columns={[
                {
                  title: '问题',
                  dataIndex: 'question',
                  key: 'question',
                  ellipsis: true,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Badge status={status === '已解答' ? 'success' : 'processing'} text={status} />
                  ),
                },
                {
                  title: '分类',
                  dataIndex: 'category',
                  key: 'category',
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 深度分析部分 */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card
            title="深度教学分析"
            className={styles.chartContainer}
            extra={
              <Button
                type="primary"
                onClick={() => fetchDeepAnalysis(true)}
                loading={loadingAnalysis}
              >
                {loadingAnalysis
                  ? '分析中...'
                  : showAnalysis
                    ? '重新获取分析'
                    : deepAnalysis
                      ? '查看分析'
                      : '获取深度分析'}
              </Button>
            }
          >
            {showAnalysis ? (
              <div className={styles.analysisSection}>
                {loadingAnalysis && deepAnalysis === '' ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spin />
                    <div style={{ marginTop: '10px' }}>正在生成分析，请稍候...</div>
                  </div>
                ) : (
                  <>
                    <div className={styles.streamingContent}>
                      <MarkdownRenderer content={deepAnalysis} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <p style={{ color: token.colorTextSecondary }}>
                  点击"获取深度分析"按钮，系统将结合学生数据、问题类型和练习情况，为您提供详细的教学建议。
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const StudentView: React.FC<{ data: StudentData }> = ({ data }) => {
  const [deepAnalysis, setDeepAnalysis] = useState<string>('');
  const [rawAnalysisData, setRawAnalysisData] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const analysisStreamRef = useRef<EventSource | null>(null);
  const { data: session } = useSession();
  const { token } = theme.useToken();

  // 从会话存储初始化
  useEffect(() => {
    // 首先从会话存储或全局状态加载内容
    if (globalState.studentAnalysisContent) {
      setDeepAnalysis(globalState.studentAnalysisContent);
      if (globalState.studentAnalysisContent.length > 0) {
        setShowAnalysis(true);
      }
    } else if (sessionStorage.studentAnalysis) {
      setDeepAnalysis(sessionStorage.studentAnalysis);
      if (sessionStorage.studentAnalysis.length > 0) {
        setShowAnalysis(true);
      }
    } else if (session?.user?.id) {
      // 如果会话存储为空，则尝试从localStorage加载
      try {
        const storedData = localStorage.getItem(STORAGE_KEY.STUDENT_ANALYSIS);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.userId === session.user.id && parsedData.analysis) {
            setDeepAnalysis(parsedData.analysis);
            sessionStorage.studentAnalysis = parsedData.analysis;
            globalState.studentAnalysisContent = parsedData.analysis;
            // 不立即显示，等用户点击按钮
          }
        }
      } catch (e) {
        console.error('解析存储的分析数据错误:', e);
      }
    }

    // 组件卸载时的清理 - 立即关闭连接
    return () => {
      if (analysisStreamRef.current) {
        // 立即关闭连接，不保持状态
        analysisStreamRef.current.close();
        analysisStreamRef.current = null;

        // 保存已生成的内容
        globalState.studentAnalysisContent = deepAnalysis;

        // 如果正在加载，显示提示给用户
        if (loadingAnalysis) {
          setLoadingAnalysis(false);
          alert('页面切换，分析已停止。请返回后重新获取分析。');
        }
      }
    };
  }, [session]);

  // 修改setupEventHandlers函数
  const setupEventHandlers = (eventSource: EventSource) => {
    eventSource.onmessage = (event) => {
      try {
        const data: StreamAnalysisData = JSON.parse(event.data);

        if (data.error) {
          console.error('分析错误:', data.error);
          setLoadingAnalysis(false);
          eventSource.close();
          return;
        }

        if (data.message === 'analysis_complete') {
          setLoadingAnalysis(false);
          eventSource.close();
          setShowAnalysis(true);

          // 在存储前处理内容，确保没有未闭合的代码块
          setDeepAnalysis((prev) => {
            // 检查是否有未闭合的代码块
            const codeBlockCount = (prev.match(/```/g) || []).length;
            let finalContent = prev;
            if (codeBlockCount % 2 !== 0) {
              finalContent += '\n```';
            }

            // 移除可能的空pre标签
            finalContent = finalContent.replace(/```\s*```/g, '');

            // 存储最终版本
            if (session?.user?.id) {
              const storageData = {
                userId: session.user.id,
                analysis: finalContent,
                timestamp: new Date().toISOString(),
              };
              localStorage.setItem(STORAGE_KEY.STUDENT_ANALYSIS, JSON.stringify(storageData));
              sessionStorage.studentAnalysis = finalContent;
              globalState.studentAnalysisContent = finalContent;
            }

            return finalContent;
          });

          return;
        }

        if (data.type === 'content' && data.text) {
          setDeepAnalysis((prev) => {
            const newContent = prev + data.text;

            // 更新全局状态
            globalState.studentAnalysisContent = newContent;
            sessionStorage.studentAnalysis = newContent;

            // 一旦有内容开始生成，立即显示分析部分
            if (!showAnalysis && newContent.length > 0) {
              setShowAnalysis(true);
            }
            return newContent;
          });
        }

        if (data.type === 'raw_data' && data.data) {
          setRawAnalysisData(data.data);
        }
      } catch (e) {
        console.error('解析SSE数据错误:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE错误:', error);
      setLoadingAnalysis(false);
      eventSource.close();
    };
  };

  const fetchDeepAnalysis = async (forceRefresh = false) => {
    // 如果已经有内容且不是强制刷新，则直接显示
    if (deepAnalysis && !forceRefresh) {
      setShowAnalysis(true);
      return;
    }

    try {
      setLoadingAnalysis(true);
      // 不再隐藏分析部分，使生成内容能够立即显示
      setDeepAnalysis('');
      sessionStorage.studentAnalysis = '';
      globalState.studentAnalysisContent = '';

      // 关闭之前的连接
      if (analysisStreamRef.current) {
        analysisStreamRef.current.close();
        analysisStreamRef.current = null;
      }

      // 创建SSE连接
      const eventSource = new EventSource('/api/analysis/deep-analysis');
      analysisStreamRef.current = eventSource;

      // 设置事件处理器
      setupEventHandlers(eventSource);
    } catch (error) {
      console.error('获取深度分析失败:', error);
      setLoadingAnalysis(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic title="总提问数" value={data.totalQuestions} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已回答问题"
              value={data.answeredQuestions}
              prefix={<CheckCircleOutlined />}
              suffix={
                data.totalQuestions > 0
                  ? `(${Math.round((data.answeredQuestions / data.totalQuestions) * 100)}%)`
                  : ''
              }
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="可做的练习总数"
              value={data.exerciseStats.totalExercises}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="学习次数"
              value={data.studentStats.totalStudySessions}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="学习科目数"
              value={data.studentStats.studiedSubjects}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="问题分类统计">
            <ReactECharts
              option={{
                tooltip: {
                  trigger: 'item',
                  formatter: '{a} <br/>{b}: {c} ({d}%)',
                },
                legend: {
                  orient: 'vertical',
                  left: 10,
                  data: data.categoryStats.map((item) => item.name),
                },
                series: [
                  {
                    name: '问题分类',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                      show: false,
                      position: 'center',
                    },
                    emphasis: {
                      label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold',
                      },
                    },
                    labelLine: {
                      show: false,
                    },
                    data: data.categoryStats.map((item) => ({
                      value: item.count,
                      name: item.name,
                    })),
                  },
                ],
              }}
              style={{ height: '300px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="学习建议">
            <div style={{ padding: '20px' }}>
              <List
                size="small"
                dataSource={data.analysisSuggestions.learningSuggestions}
                renderItem={(item: unknown) => (
                  <List.Item>
                    <Badge status="processing" text={String(item)} />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="练习难度分布">
            <ReactECharts
              option={{
                tooltip: {
                  trigger: 'item',
                  formatter: '{a} <br/>{b}: {c} ({d}%)',
                },
                legend: {
                  orient: 'vertical',
                  left: 10,
                  data: data.exerciseDifficulty.map((item) => item.difficulty),
                },
                series: [
                  {
                    name: '难度分布',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                      show: false,
                      position: 'center',
                    },
                    emphasis: {
                      label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold',
                      },
                    },
                    labelLine: {
                      show: false,
                    },
                    data: data.exerciseDifficulty.map((item) => ({
                      value: item.count,
                      name: item.difficulty,
                    })),
                  },
                ],
              }}
              style={{ height: '300px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="问题类型分析">
            <Table
              dataSource={data.analysisSuggestions.questionAnalysis.map((item, index) => ({
                key: index,
                ...item,
              }))}
              columns={[
                {
                  title: '问题类型',
                  dataIndex: 'type',
                  key: 'type',
                },
                {
                  title: '数量',
                  dataIndex: 'count',
                  key: 'count',
                },
                {
                  title: '占比',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (percentage) => `${percentage}%`,
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 深度分析部分 */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card
            title="深度学习分析"
            className={styles.chartContainer}
            extra={
              <Button
                type="primary"
                onClick={() => fetchDeepAnalysis(true)}
                loading={loadingAnalysis}
              >
                {loadingAnalysis
                  ? '分析中...'
                  : showAnalysis
                    ? '重新获取分析'
                    : deepAnalysis
                      ? '查看分析'
                      : '获取深度分析'}
              </Button>
            }
          >
            {showAnalysis ? (
              <div className={styles.analysisSection}>
                {loadingAnalysis && deepAnalysis === '' ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spin />
                    <div style={{ marginTop: '10px' }}>正在生成分析，请稍候...</div>
                  </div>
                ) : (
                  <>
                    <div className={styles.streamingContent}>
                      <MarkdownRenderer content={deepAnalysis} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <p style={{ color: token.colorTextSecondary }}>
                  点击"获取深度分析"按钮，系统将分析您的学习数据，为您提供个性化的学习建议和规划。
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const AnalysisPage: React.FC = () => {
  const { data: session } = useSession();
  const userType = session?.user?.type || 'student';
  const [data, setData] = useState<TeacherData | StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch('/api/analysis/data');
        if (!response.ok) {
          throw new Error('获取分析数据失败');
        }
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error('获取分析数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [session]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <Spin size="large" tip="正在加载数据..." />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>无法获取分析数据</h2>
          <p>请稍后再试或联系管理员</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 使用类型断言确保类型安全 */}
      {userType === 'teacher' ? (
        <TeacherView data={data as TeacherData} />
      ) : (
        <StudentView data={data as StudentData} />
      )}
    </div>
  );
};

export default AnalysisPage;

import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  FileOutlined,
  FileTextOutlined,
  LoadingOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, Collapse, List, Row, Spin, Statistic, Table } from 'antd';
// @ts-ignore
import ReactECharts from 'echarts-for-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
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

const TeacherView: React.FC<{ data: TeacherData }> = ({ data }) => {
  const [deepAnalysis, setDeepAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

  const fetchDeepAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const response = await fetch('/api/analysis/deep-analysis');
      if (!response.ok) {
        throw new Error('获取深度分析失败');
      }
      const responseData = await response.json();
      setDeepAnalysis(responseData.analysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('获取深度分析失败:', error);
    } finally {
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
            extra={
              !showAnalysis ? (
                <Button type="primary" onClick={fetchDeepAnalysis} loading={loadingAnalysis}>
                  {loadingAnalysis ? '分析中...' : '获取深度分析'}
                </Button>
              ) : null
            }
          >
            {loadingAnalysis ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                <p style={{ marginTop: '20px' }}>正在进行深度分析，这可能需要一些时间...</p>
              </div>
            ) : showAnalysis && deepAnalysis ? (
              <div className={styles.analysisSection}>
                <Collapse defaultActiveKey={['1']}>
                  <Collapse.Panel header="教学分析结果" key="1">
                    {deepAnalysis.split('\n\n').map((paragraph, index) => (
                      <div key={index} style={{ marginBottom: '16px' }}>
                        {paragraph.split('\n').map((line, lineIndex) => (
                          <p
                            key={lineIndex}
                            style={line.startsWith('#') ? { fontWeight: 'bold' } : {}}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </Collapse.Panel>
                </Collapse>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <p>
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
  const [deepAnalysis, setDeepAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

  const fetchDeepAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const response = await fetch('/api/analysis/deep-analysis');
      if (!response.ok) {
        throw new Error('获取深度分析失败');
      }
      const responseData = await response.json();
      setDeepAnalysis(responseData.analysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('获取深度分析失败:', error);
    } finally {
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
            title="个性化学习分析"
            extra={
              !showAnalysis ? (
                <Button type="primary" onClick={fetchDeepAnalysis} loading={loadingAnalysis}>
                  {loadingAnalysis ? '分析中...' : '获取学习分析'}
                </Button>
              ) : null
            }
          >
            {loadingAnalysis ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                <p style={{ marginTop: '20px' }}>正在进行个性化学习分析，这可能需要一些时间...</p>
              </div>
            ) : showAnalysis && deepAnalysis ? (
              <div className={styles.analysisSection}>
                <Collapse defaultActiveKey={['1']}>
                  <Collapse.Panel header="个性化学习建议" key="1">
                    {deepAnalysis.split('\n\n').map((paragraph, index) => (
                      <div key={index} style={{ marginBottom: '16px' }}>
                        {paragraph.split('\n').map((line, lineIndex) => (
                          <p
                            key={lineIndex}
                            style={
                              line.startsWith('#') || line.match(/^\d+\./)
                                ? { fontWeight: 'bold', marginTop: '12px' }
                                : {}
                            }
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </Collapse.Panel>
                </Collapse>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <p>
                  点击"获取学习分析"按钮，系统将分析您的学习数据，为您提供个性化的学习建议和规划。
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

import {
  BookOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  MessageOutlined,
  RobotOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Card, Col, Progress, Row, Statistic, Tag } from 'antd';
import React from 'react';

const getMockData = (userType: string) => {
  if (userType === 'teacher') {
    // 教师视角
    return {
      totalQuestions: 320,
      answeredQuestions: 300,
      averageResponseTime: 20,
      satisfactionRate: 95,
      recentQuestions: [
        {
          question: '如何设计高效的需求分析流程？',
          status: '已解答',
          time: '2024-01-05 09:00',
          category: '需求工程',
        },
        {
          question: '操作系统实验考核标准是什么？',
          status: '已解答',
          time: '2024-01-04 15:30',
          category: '操作系统',
        },
        {
          question: '网络安全课程有哪些重点？',
          status: '待解答',
          time: '2024-01-03 11:20',
          category: '计算机网络',
        },
      ],
      categoryStats: [
        { name: '需求工程', count: 120, percentage: 37 },
        { name: '操作系统', count: 100, percentage: 31 },
        { name: '计算机网络', count: 100, percentage: 32 },
      ],
      teacherStats: {
        totalStudents: 80,
        activeStudents: 65,
        avgScore: 88,
        classSatisfaction: 92,
      },
      ragStats: {
        totalDocuments: 1500,
        averageRetrievalTime: 0.8,
        retrievalAccuracy: 92,
        knowledgeCoverage: 85,
        recentImprovements: [
          {
            type: '知识库更新',
            description: '新增操作系统相关文档50篇',
            time: '2024-01-04',
          },
          {
            type: '模型优化',
            description: '优化了检索算法，提升准确率2%',
            time: '2024-01-03',
          },
        ],
      },
      analysisSuggestions: {
        questionPatterns: [
          {
            category: '需求工程',
            pattern: '需求分析方法和流程',
            count: 45,
            percentage: 37.5,
          },
          {
            category: '操作系统',
            pattern: '进程调度和内存管理',
            count: 30,
            percentage: 25,
          },
          {
            category: '计算机网络',
            pattern: 'TCP/IP协议和网络安全',
            count: 25,
            percentage: 20.8,
          },
        ],
        teachingSuggestions: [
          '需求工程类问题占比最高，建议在课堂上增加实际案例分析',
          '操作系统相关问题的响应时间较长，建议录制专题讲解视频',
          '网络安全类问题准确率较低，建议更新相关教学资料',
        ],
      },
    };
  }
  // 学生视角
  return {
    totalQuestions: 150,
    answeredQuestions: 120,
    averageResponseTime: 30,
    satisfactionRate: 90,
    recentQuestions: [
      {
        question: '需求工程中的需求分析有哪些方法？',
        status: '已解答',
        time: '2024-01-01 10:00',
        category: '需求工程',
      },
      {
        question: '操作系统的进程调度算法有哪些？',
        status: '待解答',
        time: '2024-01-02 14:30',
        category: '操作系统',
      },
      {
        question: 'TCP和UDP的区别是什么？',
        status: '已解答',
        time: '2024-01-03 09:15',
        category: '计算机网络',
      },
    ],
    categoryStats: [
      { name: '需求工程', count: 50, percentage: 33 },
      { name: '操作系统', count: 45, percentage: 30 },
      { name: '计算机网络', count: 55, percentage: 37 },
    ],
    studentStats: {
      totalStudyTime: 120,
      completedCourses: 3,
      averageScore: 85,
      studyProgress: 75,
    },
    ragStats: {
      totalDocuments: 1500,
      averageRetrievalTime: 0.8,
      retrievalAccuracy: 92,
      knowledgeCoverage: 85,
      recentImprovements: [
        {
          type: '知识库更新',
          description: '新增操作系统相关文档50篇',
          time: '2024-01-04',
        },
        {
          type: '模型优化',
          description: '优化了检索算法，提升准确率2%',
          time: '2024-01-03',
        },
      ],
    },
    analysisSuggestions: {
      questionPatterns: [
        {
          category: '需求工程',
          pattern: '需求分析方法和流程',
          count: 20,
          percentage: 40,
        },
        {
          category: '操作系统',
          pattern: '进程调度和内存管理',
          count: 15,
          percentage: 30,
        },
        {
          category: '计算机网络',
          pattern: 'TCP/IP协议和网络安全',
          count: 10,
          percentage: 20,
        },
      ],
      learningSuggestions: [
        '需求工程类问题较多，建议加强相关课程的学习，特别是需求分析方法和工具的使用',
        '操作系统相关问题的准确率较低，建议复习进程调度和内存管理的核心概念',
        '网络安全类问题较少，建议多关注该领域的学习，特别是常见的安全威胁和防护措施',
      ],
      questionAnalysis: [
        {
          type: '概念理解类',
          count: 25,
          percentage: 50,
          examples: ['什么是需求工程？', '进程和线程的区别是什么？', 'TCP三次握手的过程是怎样的？'],
        },
        {
          type: '实践应用类',
          count: 15,
          percentage: 30,
          examples: ['如何编写需求规格说明书？', '如何实现进程调度算法？', '如何配置网络防火墙？'],
        },
        {
          type: '问题解决类',
          count: 10,
          percentage: 20,
          examples: ['如何处理需求变更？', '如何解决死锁问题？', '如何排查网络故障？'],
        },
      ],
    },
  };
};

const AnalysisPage: React.FC = () => {
  // 读取用户类型
  const userType =
    typeof window !== 'undefined' ? localStorage.getItem('userType') || 'student' : 'student';
  const mockData = getMockData(userType);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总提问数"
              value={mockData.totalQuestions}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已回答问题"
              value={mockData.answeredQuestions}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={mockData.averageResponseTime}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="满意度"
              value={mockData.satisfactionRate}
              suffix="%"
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 教师专属统计 */}
      {userType === 'teacher' && (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="学生总数"
                value={mockData.teacherStats.totalStudents}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="活跃学生"
                value={mockData.teacherStats.activeStudents}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="班级平均分"
                value={mockData.teacherStats.avgScore}
                suffix="分"
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 学生专属统计 */}
      {userType === 'student' && (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总学习时长"
                value={mockData.studentStats.totalStudyTime}
                suffix="小时"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="已完成课程"
                value={mockData.studentStats.completedCourses}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="平均分数"
                value={mockData.studentStats.averageScore}
                suffix="分"
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <ProCard title="问题分类统计" headerBordered>
            {mockData.categoryStats.map((category, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                >
                  <span>{category.name}</span>
                  <span>{category.count} 个问题</span>
                </div>
                <Progress percent={category.percentage} status="active" />
              </div>
            ))}
          </ProCard>
        </Col>
        <Col span={12}>
          <ProCard title="最近问题记录" headerBordered>
            {mockData.recentQuestions.map((question, index) => (
              <div
                key={index}
                style={{ marginBottom: '12px', padding: '8px', borderBottom: '1px solid #f0f0f0' }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}
                >
                  <Tag color={question.status === '已解答' ? 'green' : 'orange'}>
                    {question.status}
                  </Tag>
                  <span style={{ color: '#999' }}>{question.time}</span>
                </div>
                <p style={{ margin: '4px 0' }}>{question.question}</p>
                <Tag color="blue">{question.category}</Tag>
              </div>
            ))}
          </ProCard>
        </Col>
      </Row>

      {/* 个性化分析建议 */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <ProCard title={userType === 'teacher' ? '教学分析建议' : '学习分析建议'} headerBordered>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <h4>问题分布分析</h4>
                  {mockData.analysisSuggestions.questionPatterns.map((pattern, index) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {pattern.category} - {pattern.pattern}
                        </span>
                        <span>
                          {pattern.count} 个问题 ({pattern.percentage}%)
                        </span>
                      </div>
                      <Progress percent={pattern.percentage} status="active" />
                    </div>
                  ))}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <h4>问题类型分析</h4>
                  {mockData.analysisSuggestions.questionAnalysis.map((analysis, index) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{analysis.type}</span>
                        <span>
                          {analysis.count} 个问题 ({analysis.percentage}%)
                        </span>
                      </div>
                      <Progress percent={analysis.percentage} status="active" />
                      <div style={{ marginTop: '8px', color: '#666' }}>
                        <p style={{ marginBottom: '4px' }}>示例问题：</p>
                        {analysis.examples.map((example, eIndex) => (
                          <p key={eIndex} style={{ margin: '4px 0', paddingLeft: '12px' }}>
                            • {example}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
            <div>
              <h4>{userType === 'teacher' ? '教学建议' : '学习建议'}</h4>
              {mockData.analysisSuggestions[
                userType === 'teacher' ? 'teachingSuggestions' : 'learningSuggestions'
              ].map((suggestion, index) => (
                <p key={index} style={{ marginBottom: '8px' }}>
                  {index + 1}. {suggestion}
                </p>
              ))}
            </div>
          </ProCard>
        </Col>
      </Row>

      {/* RAG系统统计 */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="知识库文档数"
              value={mockData.ragStats.totalDocuments}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均检索时间"
              value={mockData.ragStats.averageRetrievalTime}
              suffix="秒"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="检索准确率"
              value={mockData.ragStats.retrievalAccuracy}
              suffix="%"
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="知识覆盖率"
              value={mockData.ragStats.knowledgeCoverage}
              suffix="%"
              prefix={<BulbOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <ProCard title="RAG系统改进记录" headerBordered>
            {mockData.ragStats.recentImprovements.map((improvement, index) => (
              <div
                key={index}
                style={{ marginBottom: '12px', padding: '8px', borderBottom: '1px solid #f0f0f0' }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}
                >
                  <Tag color="blue">{improvement.type}</Tag>
                  <span style={{ color: '#999' }}>{improvement.time}</span>
                </div>
                <p style={{ margin: '4px 0' }}>{improvement.description}</p>
              </div>
            ))}
          </ProCard>
        </Col>
      </Row>
    </div>
  );
};

export default AnalysisPage;

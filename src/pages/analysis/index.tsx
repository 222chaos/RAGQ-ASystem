import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';
import styles from './index.module.css';

interface BaseStats {
  totalQuestions: number;
  answeredQuestions: number;
  averageResponseTime: number;
  satisfactionRate: number;
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
  ragStats: {
    totalDocuments: number;
    averageRetrievalTime: number;
    retrievalAccuracy: number;
    knowledgeCoverage: number;
    recentImprovements: Array<{
      type: string;
      description: string;
      time: string;
    }>;
  };
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
}

interface StudentData extends BaseStats {
  studentStats: {
    totalStudyTime: number;
    completedCourses: number;
    averageScore: number;
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
}

const getMockData = (userType: string): TeacherData | StudentData => {
  const teacherData: TeacherData = {
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

  const studentData: StudentData = {
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

  return userType === 'teacher' ? teacherData : studentData;
};

const TeacherView: React.FC<{ data: TeacherData }> = ({ data }) => (
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
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="平均响应时间"
            value={data.averageResponseTime}
            suffix="分钟"
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="满意度"
            value={data.satisfactionRate}
            suffix="%"
            prefix={<StarOutlined />}
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
            title="活跃学生"
            value={data.teacherStats.activeStudents}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="班级平均分"
            value={data.teacherStats.avgScore}
            suffix="分"
            prefix={<StarOutlined />}
          />
        </Card>
      </Col>
    </Row>

    {/* 其他教师视图内容 */}
  </div>
);

const StudentView: React.FC<{ data: StudentData }> = ({ data }) => (
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
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="平均响应时间"
            value={data.averageResponseTime}
            suffix="分钟"
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="满意度"
            value={data.satisfactionRate}
            suffix="%"
            prefix={<StarOutlined />}
          />
        </Card>
      </Col>
    </Row>

    <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
      <Col span={8}>
        <Card>
          <Statistic
            title="总学习时长"
            value={data.studentStats.totalStudyTime}
            suffix="小时"
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="已完成课程"
            value={data.studentStats.completedCourses}
            prefix={<BookOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="平均分数"
            value={data.studentStats.averageScore}
            suffix="分"
            prefix={<StarOutlined />}
          />
        </Card>
      </Col>
    </Row>

    {/* 其他学生视图内容 */}
  </div>
);

const AnalysisPage: React.FC = () => {
  const userType = localStorage.getItem('userType') || 'student';
  const data = getMockData(userType);

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

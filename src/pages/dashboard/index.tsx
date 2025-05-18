import { FileTextOutlined, MessageOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Table } from 'antd';
import { useEffect, useState } from 'react';

interface DashboardData {
  totalTeachers: number;
  totalStudents: number;
  totalQASessions: number;
  totalExercises: number;
  teacherStats: Array<{
    id: string;
    name: string;
    studentCount: number;
    qaCount: number;
    exerciseCount: number;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalTeachers: 0,
    totalStudents: 0,
    totalQASessions: 0,
    totalExercises: 0,
    teacherStats: [],
  });

  useEffect(() => {
    // 这里添加获取数据的API调用
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const columns = [
    {
      title: '教师姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学生数量',
      dataIndex: 'studentCount',
      key: 'studentCount',
    },
    {
      title: '问答次数',
      dataIndex: 'qaCount',
      key: 'qaCount',
    },
    {
      title: '发布练习数',
      dataIndex: 'exerciseCount',
      key: 'exerciseCount',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="教师总数" value={data.totalTeachers} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="学生总数" value={data.totalStudents} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总问答次数"
              value={data.totalQASessions}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总练习数" value={data.totalExercises} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="教师数据统计" style={{ marginTop: '24px' }}>
        <Table
          columns={columns}
          dataSource={data.teacherStats}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

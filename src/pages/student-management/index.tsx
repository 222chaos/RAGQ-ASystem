import CreateStudentModal from '@/components/admin/CreateStudentModal';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Table,
} from 'antd';
import { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  teacherName: string;
  qaCount: number;
  exerciseCount: number;
  status: 'active' | 'inactive';
  teacherUsername: string;
  studentId: string;
  className: string;
  phone: string;
  recentQARecords: {
    subject: string;
    question: string;
    answer: string;
    createdAt: string;
  }[];
}

interface Teacher {
  id: string;
  name: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const columns = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '所属教师',
      dataIndex: 'teacherUsername',
      key: 'teacherUsername',
    },
    {
      title: '问答次数',
      dataIndex: 'qaCount',
      key: 'qaCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Student) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleViewDetails(record.id)}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/students');
      if (!response.ok) throw new Error('获取学生列表失败');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      message.error('获取学生列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      message.error('获取教师列表失败');
    }
  };

  const handleViewDetails = async (studentId: string) => {
    try {
      setLoadingDetails(true);
      const response = await fetch(`/api/admin/students/${studentId}/details`);
      if (!response.ok) throw new Error('获取学生详情失败');
      const data = await response.json();
      setSelectedStudent(data);
      setIsDetailsModalVisible(true);
    } catch (error) {
      message.error('获取学生详情失败');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateSuccess = () => {
    setModalVisible(false);
    fetchStudents();
    message.success('创建学生成功');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredStudents = students.filter((student) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      (student.name?.toLowerCase() || '').includes(searchLower) ||
      (student.studentId?.toLowerCase() || '').includes(searchLower) ||
      (student.className?.toLowerCase() || '').includes(searchLower) ||
      (student.phone || '').includes(searchLower) ||
      (student.email?.toLowerCase() || '').includes(searchLower) ||
      (student.teacherUsername?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索学生"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            添加学生
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <CreateStudentModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleCreateSuccess}
        teachers={teachers}
      />

      <Modal
        title="学生详情"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : selectedStudent ? (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="姓名">{selectedStudent.name}</Descriptions.Item>
              <Descriptions.Item label="学号">{selectedStudent.studentId}</Descriptions.Item>
              <Descriptions.Item label="班级">{selectedStudent.className}</Descriptions.Item>
              <Descriptions.Item label="所属教师">
                {selectedStudent.teacherUsername}
              </Descriptions.Item>
              <Descriptions.Item label="电话">{selectedStudent.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedStudent.email}</Descriptions.Item>
              <Descriptions.Item label="问答次数">{selectedStudent.qaCount}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">最近问答记录</Divider>
            <Table
              dataSource={selectedStudent.recentQARecords}
              columns={[
                {
                  title: '科目',
                  dataIndex: 'subject',
                  key: 'subject',
                },
                {
                  title: '问题',
                  dataIndex: 'question',
                  key: 'question',
                },
                {
                  title: '回答',
                  dataIndex: 'answer',
                  key: 'answer',
                },
                {
                  title: '时间',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date: string) => new Date(date).toLocaleString(),
                },
              ]}
              rowKey="id"
              pagination={false}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

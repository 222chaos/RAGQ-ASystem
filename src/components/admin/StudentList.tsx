import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import CreateStudentModal from './CreateStudentModal';

interface Student {
  id: number;
  name: string;
  studentId: string;
  className: string;
  phone: string;
  email: string;
  teacherName: string;
  qaCount: number;
}

interface Teacher {
  id: string;
  name: string;
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: '问答数',
      dataIndex: 'qaCount',
      key: 'qaCount',
    },
  ];

  const fetchStudents = async () => {
    try {
      setLoading(true);
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
      if (!response.ok) throw new Error('获取教师列表失败');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      message.error('获取教师列表失败');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

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
      (student.teacherName?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索学生..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          添加学生
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <CreateStudentModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleCreateSuccess}
        teachers={teachers}
      />
    </div>
  );
}

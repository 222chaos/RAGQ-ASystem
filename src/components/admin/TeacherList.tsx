import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import CreateTeacherModal from './CreateTeacherModal';

interface Teacher {
  id: number;
  name: string;
  studentCount: number;
  qaCount: number;
  exerciseCount: number;
}

export default function TeacherList() {
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
      title: '学生数',
      dataIndex: 'studentCount',
      key: 'studentCount',
    },
    {
      title: '问答数',
      dataIndex: 'qaCount',
      key: 'qaCount',
    },
    {
      title: '练习数',
      dataIndex: 'exerciseCount',
      key: 'exerciseCount',
    },
  ];

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/teachers');
      if (!response.ok) throw new Error('获取教师列表失败');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      message.error('获取教师列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreateSuccess = () => {
    setModalVisible(false);
    fetchTeachers();
    message.success('创建教师成功');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredTeachers = teachers.filter((teacher) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      (teacher.name?.toLowerCase() || '').includes(searchLower) ||
      teacher.id.toString().includes(searchLower) ||
      teacher.studentCount.toString().includes(searchLower) ||
      teacher.qaCount.toString().includes(searchLower) ||
      teacher.exerciseCount.toString().includes(searchLower)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索教师..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          添加教师
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTeachers}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <CreateTeacherModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

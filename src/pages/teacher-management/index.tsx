import CreateTeacherModal from '@/components/admin/CreateTeacherModal';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Modal, Space, Spin, Table } from 'antd';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  studentCount: number;
  qaCount: number;
  exerciseCount: number;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  className: string;
  phone: string;
  email: string;
  qaCount: number;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: string;
  status: string;
  created_at: string;
  deadline: string | null;
}

export default function TeacherManagement() {
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isStudentsModalVisible, setIsStudentsModalVisible] = useState(false);
  const [isExercisesModalVisible, setIsExercisesModalVisible] = useState(false);
  const [selectedTeacherStudents, setSelectedTeacherStudents] = useState<Student[]>([]);
  const [selectedTeacherExercises, setSelectedTeacherExercises] = useState<Exercise[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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
    {
      title: '操作',
      key: 'action',
      render: (_, record: Teacher) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleViewStudents(record.id)}>
            查看学生
          </Button>
          <Button type="link" onClick={() => handleViewExercises(record.id)}>
            查看练习
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
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

  const handleViewStudents = async (teacherId: string) => {
    try {
      setLoadingStudents(true);
      const response = await fetch(`/api/admin/teachers/${teacherId}/students`);
      if (!response.ok) throw new Error('获取学生列表失败');
      const data = await response.json();
      setSelectedTeacherStudents(data);
      setIsStudentsModalVisible(true);
    } catch (error) {
      message.error('获取学生列表失败');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleViewExercises = async (teacherId: string) => {
    if (!session) {
      message.error('请先登录');
      return;
    }

    try {
      setLoadingExercises(true);
      const response = await fetch(`/api/admin/teacher-exercises?teacherId=${teacherId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          message.error('您没有权限查看练习列表');
        } else {
          throw new Error('获取练习列表失败');
        }
        return;
      }

      const data = await response.json();
      setSelectedTeacherExercises(data);
      setIsExercisesModalVisible(true);
    } catch (error) {
      message.error('获取练习列表失败');
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

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
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索教师"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            添加教师
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <CreateTeacherModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <Modal
        title="学生列表"
        open={isStudentsModalVisible}
        onCancel={() => setIsStudentsModalVisible(false)}
        footer={null}
        width={800}
      >
        {loadingStudents ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={selectedTeacherStudents}
            columns={[
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
                title: '问答次数',
                dataIndex: 'qaCount',
                key: 'qaCount',
              },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>

      <Modal
        title="练习列表"
        open={isExercisesModalVisible}
        onCancel={() => {
          setIsExercisesModalVisible(false);
          setSelectedExercise(null);
        }}
        footer={null}
        width={800}
      >
        {loadingExercises ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          <Table<Exercise>
            dataSource={selectedTeacherExercises}
            columns={[
              {
                title: '标题',
                dataIndex: 'title',
                key: 'title',
              },
              {
                title: '难度',
                dataIndex: 'difficulty',
                key: 'difficulty',
              },
              {
                title: '创建时间',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (text: string) => new Date(text).toLocaleString(),
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
              },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            onRow={(record: Exercise) => ({
              onClick: () => handleExerciseClick(record),
              style: { cursor: 'pointer' },
            })}
          />
        )}
      </Modal>

      <Modal
        title={selectedExercise?.title}
        open={!!selectedExercise}
        onCancel={() => setSelectedExercise(null)}
        footer={null}
        width={800}
      >
        {selectedExercise && (
          <div>
            <p>
              <strong>描述：</strong>
              {selectedExercise.description}
            </p>
            <p>
              <strong>难度：</strong>
              {selectedExercise.difficulty}
            </p>
            <p>
              <strong>状态：</strong>
              {selectedExercise.status}
            </p>
            <p>
              <strong>创建时间：</strong>
              {new Date(selectedExercise.created_at).toLocaleString()}
            </p>
            {selectedExercise.deadline && (
              <p>
                <strong>截止时间：</strong>
                {new Date(selectedExercise.deadline).toLocaleString()}
              </p>
            )}
            <div style={{ marginTop: '20px' }}>
              <h4>练习内容：</h4>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedExercise.content}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

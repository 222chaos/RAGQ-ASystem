import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './index.module.css';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Paragraph, Title } = Typography;

interface Exercise {
  id: number;
  title: string;
  description: string;
  difficulty: '简单' | '中等' | '困难';
  content: string;
  created_at: string;
  status: '已发布' | '草稿';
  deadline?: string;
  teacher_user_id: number;
}

const ExerciseManagement = () => {
  const { data: session } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单':
        return 'green';
      case '中等':
        return 'orange';
      case '困难':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getStatusColor = (status: string) => {
    return status === '已发布' ? 'green' : 'blue';
  };

  // 获取练习列表
  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises');
      if (!response.ok) {
        throw new Error('获取练习列表失败');
      }
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      message.error('获取练习列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 在组件加载时获取数据
  useEffect(() => {
    fetchExercises();
  }, []);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className={styles.titleText}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: '10%',
      render: (difficulty: string) => {
        const colors = {
          简单: 'green',
          中等: 'orange',
          困难: 'red',
        };
        return <Tag color={colors[difficulty]}>{difficulty}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: string) => {
        const colors = {
          已发布: 'green',
          草稿: 'blue',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '15%',
      render: (date: string) =>
        new Date(date).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      sorter: (a: Exercise, b: Exercise) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      width: '15%',
      render: (deadline: string) =>
        deadline
          ? new Date(deadline).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })
          : '无',
    },
    {
      title: '操作',
      key: 'action',
      width: '12%',
      render: (_, record: Exercise) => (
        <Space size="middle">
          <Tooltip title="预览">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handlePreview(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个练习吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingExercise(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    form.setFieldsValue({
      ...exercise,
      deadline: exercise.deadline ? new Date(exercise.deadline) : null,
    });
    setIsModalVisible(true);
  };

  const handlePreview = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsPreviewVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除失败');
      }

      setExercises(exercises.filter((exercise) => exercise.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!session?.user?.id) {
        message.error('请先登录');
        return;
      }

      setLoading(true);
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD HH:mm:ss') : null,
        teacher_user_id: session.user.id,
        status: values.status === '立即发布' ? '已发布' : values.status,
      };

      const url = editingExercise ? `/api/exercises/${editingExercise.id}` : '/api/exercises';

      const method = editingExercise ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `${editingExercise ? '更新' : '创建'}练习失败`);
      }

      const result = await response.json();

      if (editingExercise) {
        setExercises(exercises.map((ex) => (ex.id === editingExercise.id ? result : ex)));
        message.success('更新成功');
      } else {
        setExercises([...exercises, result]);
        message.success('创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingExercise(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleDifficultyChange = (value: string[]) => {
    setSelectedDifficulty(value);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    } else {
      setDateRange(null);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchText.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !selectedStatus || exercise.status === selectedStatus;
    const matchesDifficulty =
      selectedDifficulty.length === 0 || selectedDifficulty.includes(exercise.difficulty);
    const matchesDate =
      !dateRange ||
      (new Date(exercise.created_at) >= new Date(dateRange[0]) &&
        new Date(exercise.created_at) <= new Date(dateRange[1]));
    return matchesSearch && matchesStatus && matchesDifficulty && matchesDate;
  });

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.filterSection}>
            <Space size="middle">
              <Input
                placeholder="搜索练习"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="状态筛选"
                style={{ width: 200 }}
                onChange={handleStatusChange}
                allowClear
                options={[
                  { label: '已发布', value: '已发布' },
                  { label: '草稿', value: '草稿' },
                ]}
              />
              <Select
                mode="multiple"
                placeholder="难度筛选"
                style={{ width: 200 }}
                onChange={handleDifficultyChange}
                options={[
                  { label: '简单', value: '简单' },
                  { label: '中等', value: '中等' },
                  { label: '困难', value: '困难' },
                ]}
              />
              <RangePicker
                onChange={handleDateRangeChange}
                placeholder={['开始日期', '结束日期']}
              />
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              创建练习
            </Button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <Table
            columns={columns}
            dataSource={filteredExercises}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </div>
      </Card>

      <Modal
        title={editingExercise ? '编辑练习' : '创建练习'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        confirmLoading={loading}
        className={styles.modalWrapper}
      >
        <div className={styles.formWrapper}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="请输入练习标题" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <TextArea rows={3} placeholder="请输入练习描述" />
            </Form.Item>

            <Form.Item
              name="difficulty"
              label="难度"
              rules={[{ required: true, message: '请选择难度' }]}
            >
              <Select placeholder="请选择难度">
                <Option value="简单">简单</Option>
                <Option value="中等">中等</Option>
                <Option value="困难">困难</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="content"
              label="练习内容"
              rules={[{ required: true, message: '请输入练习内容' }]}
            >
              <TextArea rows={6} placeholder="请输入练习内容" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              initialValue="草稿"
            >
              <Select placeholder="请选择状态">
                <Option value="草稿">保存为草稿</Option>
                <Option value="已发布">立即发布</Option>
              </Select>
            </Form.Item>

            <Form.Item name="deadline" label="截止时间">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择截止时间"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        title={editingExercise?.title}
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
        width={800}
        className={styles.modalWrapper}
      >
        {editingExercise && (
          <>
            <Paragraph>{editingExercise.description}</Paragraph>
            <div className={styles.modalFooter}>
              <Tag color={getDifficultyColor(editingExercise.difficulty)}>
                {editingExercise.difficulty}
              </Tag>
              <Tag color={getStatusColor(editingExercise.status)}>{editingExercise.status}</Tag>
              <span className={styles.createTime}>
                创建时间：{new Date(editingExercise.created_at).toLocaleString('zh-CN')}
              </span>
              {editingExercise.deadline && (
                <span className={styles.deadline}>
                  截止时间：{new Date(editingExercise.deadline).toLocaleString('zh-CN')}
                </span>
              )}
            </div>
            <div className={styles.content}>
              <Title level={4}>练习内容</Title>
              <Paragraph>{editingExercise.content}</Paragraph>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseManagement;

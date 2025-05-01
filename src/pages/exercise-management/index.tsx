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
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { useState } from 'react';
import styles from './index.module.css';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: '简单' | '中等' | '困难';
  content: string;
  createTime: string;
  status: '已发布' | '草稿';
  type: '选择题' | '填空题' | '简答题';
  points: number;
  deadline?: string;
}

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (type: string) => {
        const colors = {
          选择题: 'blue',
          填空题: 'purple',
          简答题: 'cyan',
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
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
      title: '分值',
      dataIndex: 'points',
      key: 'points',
      width: '8%',
      render: (points: number) => <span>{points}分</span>,
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
      dataIndex: 'createTime',
      key: 'createTime',
      width: '15%',
      sorter: (a: Exercise, b: Exercise) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      width: '15%',
      render: (deadline: string) => deadline || '无',
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

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      // TODO: 调用删除练习的 API
      setExercises(exercises.filter((exercise) => exercise.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD HH:mm:ss') : null,
      };

      if (editingExercise) {
        // TODO: 调用更新练习的 API
        setExercises(
          exercises.map((exercise) =>
            exercise.id === editingExercise.id ? { ...exercise, ...formattedValues } : exercise,
          ),
        );
        message.success('更新成功');
      } else {
        // TODO: 调用创建练习的 API
        const newExercise = {
          ...formattedValues,
          id: Date.now().toString(),
          createTime: new Date().toISOString().split('T')[0],
          status: '草稿',
        };
        setExercises([...exercises, newExercise]);
        message.success('创建成功');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusChange = (value: string[]) => {
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
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(exercise.status);
    const matchesDifficulty =
      selectedDifficulty.length === 0 || selectedDifficulty.includes(exercise.difficulty);
    const matchesDate =
      !dateRange ||
      (new Date(exercise.createTime) >= new Date(dateRange[0]) &&
        new Date(exercise.createTime) <= new Date(dateRange[1]));
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
                mode="multiple"
                placeholder="状态筛选"
                style={{ width: 200 }}
                onChange={handleStatusChange}
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
              name="type"
              label="练习类型"
              rules={[{ required: true, message: '请选择练习类型' }]}
            >
              <Select placeholder="请选择练习类型">
                <Option value="选择题">选择题</Option>
                <Option value="填空题">填空题</Option>
                <Option value="简答题">简答题</Option>
              </Select>
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
              name="points"
              label="分值"
              rules={[{ required: true, message: '请输入分值' }]}
            >
              <InputNumber min={1} max={100} placeholder="请输入分值" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="content"
              label="练习内容"
              rules={[{ required: true, message: '请输入练习内容' }]}
            >
              <TextArea rows={6} placeholder="请输入练习内容" />
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
        title="练习预览"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        width={800}
        footer={null}
        className={styles.modalWrapper}
      >
        {editingExercise && (
          <div className={styles.previewContent}>
            <div className={styles.previewHeader}>
              <h2>{editingExercise.title}</h2>
              <div className={styles.tagWrapper}>
                <Space>
                  <Tag color={editingExercise.status === '已发布' ? 'green' : 'blue'}>
                    {editingExercise.status}
                  </Tag>
                  <Tag
                    color={
                      editingExercise.difficulty === '简单'
                        ? 'green'
                        : editingExercise.difficulty === '中等'
                          ? 'orange'
                          : 'red'
                    }
                  >
                    {editingExercise.difficulty}
                  </Tag>
                  <Tag color="blue">{editingExercise.type}</Tag>
                  <span>{editingExercise.points}分</span>
                </Space>
              </div>
            </div>
            <div className={styles.previewDescription}>
              <h3>描述</h3>
              <p>{editingExercise.description}</p>
            </div>
            <div className={styles.previewContent}>
              <h3>练习内容</h3>
              <div className={styles.contentBox}>{editingExercise.content}</div>
            </div>
            {editingExercise.deadline && (
              <div className={styles.previewDeadline}>
                <h3>截止时间</h3>
                <p>{editingExercise.deadline}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseManagement;

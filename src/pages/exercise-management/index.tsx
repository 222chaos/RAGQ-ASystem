import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Space, Table, message } from 'antd';
import { useState } from 'react';
import styles from './index.module.css';

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  createTime: string;
}

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      title: '基础语法练习',
      description: '包含基础语法知识的练习题',
      difficulty: '简单',
      createTime: '2024-04-30',
    },
    {
      id: '2',
      title: '阅读理解练习',
      description: '提高阅读理解能力的练习题',
      difficulty: '中等',
      createTime: '2024-04-29',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Exercise) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
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
    form.setFieldsValue(exercise);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
    message.success('删除成功');
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingExercise) {
        // 编辑现有练习
        setExercises(
          exercises.map((exercise) =>
            exercise.id === editingExercise.id ? { ...exercise, ...values } : exercise,
          ),
        );
        message.success('更新成功');
      } else {
        // 添加新练习
        const newExercise = {
          ...values,
          id: Date.now().toString(),
          createTime: new Date().toISOString().split('T')[0],
        };
        setExercises([...exercises, newExercise]);
        message.success('添加成功');
      }
      setIsModalVisible(false);
    });
  };

  return (
    <div className={styles.container}>
      <Card
        title="练习管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加练习
          </Button>
        }
      >
        <Table columns={columns} dataSource={exercises} rowKey="id" />
      </Card>

      <Modal
        title={editingExercise ? '编辑练习' : '添加练习'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="difficulty"
            label="难度"
            rules={[{ required: true, message: '请选择难度' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExerciseManagement;

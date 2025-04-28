import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space } from 'antd';
import { useState } from 'react';
import styles from './index.module.css';

// 模拟班级数据
const mockClasses = [
  '计算机科学与技术1班',
  '计算机科学与技术2班',
  '软件工程1班',
  '软件工程2班',
  '人工智能1班',
  '人工智能2班',
  '数据科学与大数据技术1班',
  '数据科学与大数据技术2班',
];

// 模拟学生数据
const generateMockStudents = () => {
  const students = [];
  const names = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];

  for (let i = 1; i <= 20; i++) {
    const firstName = names[Math.floor(Math.random() * names.length)];
    const lastName = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const classIndex = Math.floor(Math.random() * mockClasses.length);

    students.push({
      id: i.toString(),
      name: `${firstName}${lastName}`,
      studentId: `2023${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
      class: mockClasses[classIndex],
      phone: `138${Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, '0')}`,
      email: `student${i}@example.com`,
    });
  }
  return students;
};

export default function StudentPage() {
  const [students, setStudents] = useState(generateMockStudents());
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const filtered = students.filter((student) => {
      return Object.entries(values).every(([key, value]) => {
        if (!value) return true; // 如果查询条件为空，则不过滤
        return String(student[key]).toLowerCase().includes(String(value).toLowerCase());
      });
    });
    setFilteredStudents(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredStudents(students);
  };

  const columns = [
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
      dataIndex: 'class',
      key: 'class',
      renderFormItem: () => (
        <Select>
          {mockClasses.map((cls) => (
            <Select.Option key={cls} value={cls}>
              {cls}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该学生吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = (id) => {
    setStudents(students.filter((student) => student.id !== id));
    message.success('删除成功');
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (values.id) {
        // 编辑
        setStudents(
          students.map((student) => (student.id === values.id ? { ...values } : student)),
        );
        message.success('修改成功');
      } else {
        // 新增
        const newStudent = {
          ...values,
          id: (students.length + 1).toString(),
        };
        setStudents([...students, newStudent]);
        message.success('添加成功');
      }
      setIsModalVisible(false);
    });
  };

  return (
    <div className={styles.container}>
      <ProTable
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          optionRender: (_, __, dom) => [
            <Button
              key="search"
              icon={<SearchOutlined />}
              type="primary"
              onClick={handleSearch}
              style={{ marginRight: 8 }}
            >
              查询
            </Button>,
            dom[0], // 重置按钮
          ],
          form: searchForm,
        }}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
            添加学生
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
      />

      <Modal
        title={form.getFieldValue('id') ? '编辑学生' : '添加学生'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="studentId"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="class" label="班级" rules={[{ required: true, message: '请选择班级' }]}>
            <Select>
              {mockClasses.map((cls) => (
                <Select.Option key={cls} value={cls}>
                  {cls}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

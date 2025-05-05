import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space } from 'antd';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
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

interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  phone: string;
  email: string;
}

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { data: session } = useSession();

  const fetchStudents = async () => {
    if (!session?.user?.id) return;

    setTableLoading(true);
    try {
      const response = await fetch(`/api/student/list?teacherUserId=${session.user.id}`);
      const result = await response.json();

      if (response.ok) {
        setStudents(result.data);
        setFilteredStudents(result.data);
      } else {
        message.error(result.message || '获取学生列表失败');
      }
    } catch (error) {
      message.error('获取学生列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [session?.user?.id]);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const filtered = students.filter((student) => {
      return Object.entries(values).every(([key, value]) => {
        if (!value) return true;
        return String(student[key]).toLowerCase().includes(String(value).toLowerCase());
      });
    });
    setFilteredStudents(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredStudents(students);
    fetchStudents(); // 重新获取所有学生数据
  };

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Student) => {
    form.setFieldsValue({
      ...record,
      class: record.class,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/student/delete?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        message.success('删除成功');
        fetchStudents();
      } else {
        message.error(data.message || '删除失败');
      }
    } catch (error) {
      message.error('删除过程中发生错误');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const isEdit = form.getFieldValue('id');
      const url = isEdit ? '/api/student/update' : '/api/auth/register-student';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          id: form.getFieldValue('id'),
          studentId: values.studentId,
          className: values.class,
          teacherUserId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(isEdit ? '更新成功' : '添加成功');
        setIsModalVisible(false);
        fetchStudents(); // 刷新学生列表
      } else {
        message.error(data.message || (isEdit ? '更新失败' : '添加失败'));
      }
    } catch (error) {
      message.error('操作过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleContactEdit = (record: Student) => {
    setSelectedStudent(record);
    contactForm.setFieldsValue({
      id: record.id,
      phone: record.phone,
      email: record.email,
    });
    setIsContactModalVisible(true);
  };

  const handleContactSubmit = async () => {
    try {
      const values = await contactForm.validateFields();
      setLoading(true);

      const response = await fetch('/api/student/update-contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('联系方式更新成功');
        setIsContactModalVisible(false);
        fetchStudents(); // 刷新学生列表
      } else {
        message.error(data.message || '更新失败');
      }
    } catch (error) {
      message.error('更新过程中发生错误');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className={styles.container}>
      <ProTable
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        loading={tableLoading}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: true,
          optionRender: (searchConfig, formProps, dom) => [
            <Button
              key="search"
              icon={<SearchOutlined />}
              type="primary"
              onClick={handleSearch}
              style={{ marginRight: 8 }}
            >
              查询
            </Button>,
            <Button
              key="reset"
              onClick={() => {
                formProps.form?.resetFields();
                handleReset();
              }}
            >
              重置
            </Button>,
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
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
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
            <Input disabled={!!form.getFieldValue('id')} />
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
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑联系方式"
        open={isContactModalVisible}
        onOk={handleContactSubmit}
        onCancel={() => {
          setIsContactModalVisible(false);
          contactForm.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={contactForm} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

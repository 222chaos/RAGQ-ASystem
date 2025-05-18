import { Form, Input, Modal, Select, message } from 'antd';
import { useState } from 'react';

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

interface CreateStudentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  teachers: { id: string; name: string }[];
}

interface StudentFormData {
  name: string;
  studentId: string;
  class: string;
  phone: string;
  email: string;
  teacherId: string;
}

export default function CreateStudentModal({
  visible,
  onCancel,
  onSuccess,
  teachers,
}: CreateStudentModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      console.log('提交的数据:', {
        name: values.name,
        studentId: values.studentId,
        className: values.class,
        phone: values.phone,
        email: values.email,
        teacherId: values.teacherId,
      });

      const response = await fetch('/api/auth/register-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          studentId: values.studentId,
          className: values.class,
          phone: values.phone,
          email: values.email,
          teacherUserId: values.teacherId,
        }),
      });

      const data = await response.json();
      console.log('API响应:', data);

      if (response.ok) {
        form.resetFields();
        onSuccess();
      } else {
        message.error(data.message || '创建失败');
      }
    } catch (error) {
      console.error('创建学生时发生错误:', error);
      if (error instanceof Error) {
        message.error(`创建失败: ${error.message}`);
      } else {
        message.error('创建过程中发生错误');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="添加学生"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
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
        <Form.Item
          name="teacherId"
          label="所属教师"
          rules={[{ required: true, message: '请选择所属教师' }]}
        >
          <Select>
            {teachers.map((teacher) => (
              <Select.Option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

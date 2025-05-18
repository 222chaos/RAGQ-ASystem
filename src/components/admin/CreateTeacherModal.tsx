import { Form, Input, message, Modal } from 'antd';
import { useState } from 'react';

interface CreateTeacherModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface TeacherFormData {
  username: string;
  password: string;
}

export default function CreateTeacherModal({
  visible,
  onCancel,
  onSuccess,
}: CreateTeacherModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          type: 'teacher',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '创建失败');
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('创建失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="创建教师账号"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

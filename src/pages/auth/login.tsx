import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Radio } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './Auth.module.css';

interface LoginFormValues {
  username: string;
  password: string;
  userType: 'admin' | 'teacher' | 'student';
}

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        username: values.username,
        password: values.password,
        type: values.userType,
        redirect: true,
        callbackUrl: `/?type=${values.userType}`,
      });

      if (result?.error) {
        message.error('用户名或密码错误');
        return;
      }

      // 保存用户类型到 localStorage
      localStorage.setItem('userType', values.userType);
      localStorage.setItem('username', values.username);
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <h1>登录</h1>
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ userType: 'student' }}
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="账号" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item name="userType" rules={[{ required: true, message: '请选择用户类型' }]}>
            <Radio.Group>
              <Radio.Button value="student">学生</Radio.Button>
              <Radio.Button value="teacher">教师</Radio.Button>
              <Radio.Button value="admin">管理员</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <p className={styles.switchAuth}>
          还没有账号？ <a href="/auth/register">立即注册</a>
        </p>
      </div>
    </div>
  );
}

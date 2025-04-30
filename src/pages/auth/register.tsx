import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './Auth.module.css';

export default function Register() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          type: 'teacher', // 固定为教师类型
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('注册成功，正在自动登录...');

        // 自动登录
        const result = await signIn('credentials', {
          redirect: false,
          username: values.username,
          password: values.password,
          type: 'teacher',
        });

        if (result?.error) {
          message.error('自动登录失败，请手动登录');
          router.push('/auth/login');
        } else {
          localStorage.setItem('userType', 'teacher');
          router.push('/');
        }
      } else {
        message.error(data.message || '注册失败');
      }
    } catch (error) {
      message.error('注册过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <h1>教师注册</h1>
        <Form form={form} name="register" onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                注册
              </Button>
              <Button type="default" size="large" block onClick={() => router.push('/auth/login')}>
                返回登录
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

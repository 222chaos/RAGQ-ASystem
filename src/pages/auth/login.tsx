import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, message } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../../styles/Auth.module.css';

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: values.username,
        password: values.password,
        type: values.userType,
        callbackUrl: '/',
      });

      if (result?.error) {
        message.error(result.error);
      } else {
        message.success(`欢迎，${values.username}！`);
        localStorage.setItem('userType', values.userType);
        router.push('/');
      }
    } catch (error) {
      message.error('登录过程中发生错误');
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
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item name="userType" rules={[{ required: true, message: '请选择用户类型' }]}>
            <Radio.Group>
              <Radio.Button value="student">学生</Radio.Button>
              <Radio.Button value="teacher">教师</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        {/* <p className={styles.switchAuth}>
          还没有账号？ <a href="/auth/register">立即注册</a>
        </p> */}
      </div>
    </div>
  );
}

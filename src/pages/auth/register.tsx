import { message } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../../styles/Auth.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }

      message.success('注册成功！正在自动登录...');

      // 自动登录
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        message.error('自动登录失败，请手动登录');
        router.push('/');
      } else {
        router.push('/');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <h1>注册</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p className={styles.switchAuth}>
          已有账号？ <a href="/auth/login">立即登录</a>
        </p>
      </div>
    </div>
  );
}

import { message } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../../styles/Auth.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
        type: userType,
        callbackUrl: '/',
      });

      if (result?.error) {
        message.error(result.error);
      } else {
        message.success(`欢迎，${username}！`);
        localStorage.setItem('userType', userType);
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
          <div className={styles.radioGroup}>
            <div className={styles.radioLabel}>
              <input
                type="radio"
                id="student"
                name="userType"
                value="student"
                checked={userType === 'student'}
                onChange={() => setUserType('student')}
              />
              <label htmlFor="student">学生</label>
            </div>
            <div className={styles.radioLabel}>
              <input
                type="radio"
                id="teacher"
                name="userType"
                value="teacher"
                checked={userType === 'teacher'}
                onChange={() => setUserType('teacher')}
              />
              <label htmlFor="teacher">教师</label>
            </div>
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        {/* <p className={styles.switchAuth}>
          还没有账号？ <a href="/auth/register">立即注册</a>
        </p> */}
      </div>
    </div>
  );
}

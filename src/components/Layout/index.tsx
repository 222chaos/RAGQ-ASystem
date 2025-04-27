import {
  BarChartOutlined,
  BookOutlined,
  FileTextOutlined,
  LockOutlined,
  LogoutOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { neon } from '@neondatabase/serverless';
import { Avatar, Dropdown, Form, Input, Layout, Menu, message, Modal, theme } from 'antd';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './index.module.css';

const { Header, Content, Sider } = Layout;

const menuItems = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人信息管理',
  },
  {
    key: 'permission',
    icon: <LockOutlined />,
    label: '权限管理',
  },
  {
    key: 'knowledge',
    icon: <BookOutlined />,
    label: '知识库管理',
  },
  {
    key: 'qa',
    icon: <QuestionCircleOutlined />,
    label: '问答模块',
  },
  {
    key: 'feedback',
    icon: <MessageOutlined />,
    label: '反馈模块',
  },
  {
    key: 'notes',
    icon: <FileTextOutlined />,
    label: '笔记模块',
  },
  {
    key: 'analysis',
    icon: <BarChartOutlined />,
    label: '个性化分析模块',
  },
];

export default function ProLayout({ children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [username, setUsername] = useState('');

  // 从数据库获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const sql = neon(process.env.DATABASE_URL!);
        const result =
          await sql`SELECT username, avatar_url FROM users WHERE id = ${sessionStorage.getItem('userId')}`;

        if (result && result.length > 0) {
          const user = result[0];
          setUsername(user.username);
          if (user.avatar_url) {
            setAvatarUrl(user.avatar_url);
            localStorage.setItem('avatarUrl', user.avatar_url);
          }
          localStorage.setItem('username', user.username);
          message.success(`欢迎，${user.username}！`);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      localStorage.removeItem('username');
      localStorage.removeItem('avatarUrl');
      sessionStorage.removeItem('userId');
      message.success('退出登录成功');
      router.push('/auth/login');
    } catch (error) {
      message.error('退出登录失败，请重试');
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('个人信息更新成功');
        if (values.avatar_url) {
          setAvatarUrl(values.avatar_url);
          localStorage.setItem('avatarUrl', values.avatar_url);
        }
        setIsModalVisible(false);
      } else {
        message.error(data.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败，请重试');
    }
  };

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        style={{ height: '100vh', overflow: 'hidden' }}
      >
        <div className={styles.logo} onClick={() => router.push('/')}>
          <img style={{ position: 'relative', left: '0em' }} src="/logo.png" alt="Logo" />
          {!collapsed && <span>帮你读</span>}
        </div>
        <Menu
          theme="light"
          defaultSelectedKeys={[router.pathname.split('/')[1] || '']}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => router.push(`/${key}`)}
          style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: token.colorBgContainer,
            height: 48,
            lineHeight: '48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className={styles.breadcrumb}>
            {menuItems.find((item) => item.key === (router.pathname.split('/')[1] || ''))?.label}
          </div>
          <div className={styles.headerRight}>
            <span style={{ marginRight: 16, color: '#262626' }}>{username}</span>
            <Dropdown menu={{ items }} placement="bottomRight">
              <Avatar src={avatarUrl} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            background: token.colorBgContainer,
            height: 'calc(100vh - 48px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>

      <Modal
        title="修改个人信息"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateProfile} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="avatar_url" label="头像URL">
            <Input />
          </Form.Item>
          <Form.Item>
            <button type="submit" className={styles.submitButton}>
              保存修改
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

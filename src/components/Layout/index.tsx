import {
  BarChartOutlined,
  BookOutlined,
  FileTextOutlined,
  LockOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Layout, Menu, theme } from 'antd';
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

  // 从 localStorage 获取头像URL
  useEffect(() => {
    const savedAvatar = localStorage.getItem('avatarUrl');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

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
            <Avatar
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/profile')}
            />
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
    </Layout>
  );
}

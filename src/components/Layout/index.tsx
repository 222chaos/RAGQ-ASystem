import {
  BarChartOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Form, Input, Layout, Menu, message, Modal, theme } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.module.css';

const { Header, Content, Sider } = Layout;

const getMenuItems = (userType: string) => {
  const baseItems = [
    {
      key: 'analysis',
      icon: <BarChartOutlined />,
      label: '个性化分析模块',
    },
  ];

  const studentItems = [
    {
      key: 'qa',
      icon: <QuestionCircleOutlined />,
      label: '智能问答',
    },
    {
      key: 'notes',
      icon: <FileTextOutlined />,
      label: '我的笔记',
    },
    {
      key: 'exercises',
      icon: <FileTextOutlined />,
      label: '我的练习',
    },
    ...baseItems,
  ];

  if (userType === 'teacher') {
    return [
      {
        key: 'student',
        icon: <UserOutlined />,
        label: '学生管理',
      },
      // {
      //   key: 'knowledge',
      //   icon: <BookOutlined />,
      //   label: '知识库管理',
      // },
      {
        key: 'exercise-management',
        icon: <FileTextOutlined />,
        label: '发布练习',
      },
      {
        key: 'qa',
        icon: <QuestionCircleOutlined />,
        label: '智能问答',
      },
      {
        key: 'notes',
        icon: <FileTextOutlined />,
        label: '我的笔记',
      },
      ...baseItems,
    ];
  } else {
    return studentItems;
  }
};

const profileMenuItem = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人中心',
  },
  {
    key: 'feedback',
    icon: <MessageOutlined />,
    label: '我的反馈',
  },
];
export default function ProLayout({ children }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('student');
  const [selectedKey, setSelectedKey] = useState('');
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);

  // 处理客户端localStorage的初始化
  useEffect(() => {
    // 在客户端执行时获取localStorage存储的值
    const storedAvatarUrl = localStorage.getItem('avatarUrl') || '';
    const storedUsername = localStorage.getItem('username') || '';
    const storedUserType = localStorage.getItem('userType') || 'student';

    setAvatarUrl(storedAvatarUrl);
    setUsername(storedUsername);
    setUserType(storedUserType);
  }, []);

  // 使用 useMemo 缓存菜单项
  const mainMenuItems = useMemo(() => getMenuItems(userType), [userType]);

  // 页面预加载处理函数
  const handlePrefetch = useCallback(
    (path) => {
      router.prefetch(`/${path}`);
    },
    [router],
  );

  // 路由变化时更新选中的菜单项
  useEffect(() => {
    const currentPath = router.pathname.split('/')[1] || '';
    setSelectedKey(currentPath);

    // 预加载相邻路由
    if (isMainMenuItem(currentPath)) {
      mainMenuItems.forEach((item) => {
        if (item.key !== currentPath) {
          handlePrefetch(item.key);
        }
      });
    } else if (isProfileMenuItem(currentPath)) {
      profileMenuItem.forEach((item) => {
        if (item.key !== currentPath) {
          handlePrefetch(item.key);
        }
      });
    }
  }, [router.pathname, mainMenuItems, handlePrefetch]);

  // 只在会话变化或首次加载时获取用户信息
  useEffect(() => {
    // 如果已从localStorage加载了缓存数据，并且没有session，则不执行
    if (!session?.user?.id) return;

    // 如果已经加载过用户信息，则不重复加载
    if (userInfoLoaded) return;

    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/profile/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('获取用户信息失败');
        }

        const data = await response.json();

        // 更新状态和本地存储
        setUsername(data.username);
        localStorage.setItem('username', data.username);

        if (data.userType) {
          setUserType(data.userType);
          localStorage.setItem('userType', data.userType);
        }

        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
          localStorage.setItem('avatarUrl', data.avatarUrl);
        }

        setUserInfoLoaded(true);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserInfo();
  }, [session, userInfoLoaded]);

  // 头像更新事件监听器
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarUrl(event.detail);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // 使用 useCallback 优化路由跳转
  const handleMenuClick = useCallback(
    ({ key }) => {
      router.push(`/${key}`);
    },
    [router],
  );

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      localStorage.removeItem('username');
      localStorage.removeItem('avatarUrl');
      localStorage.removeItem('userType');
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

  // 优化下拉菜单项定义，使用 useMemo
  const dropdownItems = useMemo(
    () => [
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
    ],
    [router],
  );

  // 判断当前路径是否属于主菜单
  const isMainMenuItem = useCallback(
    (path) => {
      return mainMenuItems.some((item) => item.key === path);
    },
    [mainMenuItems],
  );

  // 判断当前路径是否属于底部菜单
  const isProfileMenuItem = useCallback((path) => {
    return profileMenuItem.some((item) => item.key === path);
  }, []);

  // 使用 useMemo 缓存当前页面标题
  const currentPageTitle = useMemo(() => {
    return (
      mainMenuItems.find((item) => item.key === selectedKey)?.label ||
      profileMenuItem.find((item) => item.key === selectedKey)?.label ||
      ''
    );
  }, [mainMenuItems, selectedKey]);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        style={{
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <div className={styles.logo} onClick={() => router.push('/')}>
          <img style={{ position: 'relative', left: '0em' }} src="/logo.png" alt="Logo" />
          {!collapsed && <span>帮你读</span>}
        </div>
        <Menu
          theme="light"
          selectedKeys={isMainMenuItem(selectedKey) ? [selectedKey] : []}
          items={mainMenuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        />
        <Menu
          theme="light"
          selectedKeys={isProfileMenuItem(selectedKey) ? [selectedKey] : []}
          items={profileMenuItem}
          onClick={handleMenuClick}
          style={{
            position: 'absolute',
            bottom: '3em', // 位于折叠按钮上方
            left: 0,
            right: 0,
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            height: 48,
            lineHeight: '48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className={styles.breadcrumb}>{currentPageTitle}</div>
          <div className={styles.headerRight}>
            <span style={{ marginRight: 16, color: '#262626' }}>{username}</span>
            <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
              <Avatar
                src={avatarUrl || undefined}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
                onError={() => {
                  setAvatarUrl(null);
                  return false;
                }}
              />
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

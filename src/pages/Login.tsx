import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, theme } from 'antd';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import Notification from './Notification';
import { ThemeContext } from './_app';

export default function Component() {
  const { themeMode } = useContext(ThemeContext);

  const [notificationShown, setNotificationShown] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const storedNotificationShown = sessionStorage.getItem('notificationShown');
    if (session && !storedNotificationShown) {
      setNotificationShown(true);
      sessionStorage.setItem('notificationShown', 'true');
    } else if (!session && storedNotificationShown) {
      setNotificationShown(false);
      sessionStorage.removeItem('notificationShown');
    }
  }, [session]);

  const handleSignOut = () => {
    signOut();
    setNotificationShown(false);
    sessionStorage.removeItem('notificationShown');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: 4,
          marginRight: '3%',
          marginTop: '1%',
        }}
      >
        <AuthComponent
          session={session}
          notificationShown={notificationShown}
          setNotificationShown={setNotificationShown}
          handleSignOut={handleSignOut}
        />
      </div>
    </ConfigProvider>
  );
}

function AuthComponent({ session, notificationShown, setNotificationShown, handleSignOut }) {
  const { themeMode } = useContext(ThemeContext);

  const handleSignIn = () => {
    signIn();
    setNotificationShown(true);
    sessionStorage.setItem('notificationShown', 'true');
  };

  if (session) {
    return (
      <ConfigProvider
        theme={{
          algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <Button icon={<LogoutOutlined />} onClick={handleSignOut}>
          退出
        </Button>
        &nbsp;&nbsp;&nbsp;
        {notificationShown && <Notification />}
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Button icon={<UserOutlined />} onClick={handleSignIn}>
        登录
      </Button>
      &nbsp;&nbsp;&nbsp;
    </ConfigProvider>
  );
}

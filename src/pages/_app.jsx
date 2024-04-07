import { ConfigProvider, theme } from 'antd';
import { SessionProvider, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import '../styles/globals.css';
import Notification from './Notification';

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: 'rgb(235, 47, 150)',
        },
      }}
    >
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
        <AuthComponent />
      </SessionProvider>
      <Head>
        <title> 帮你读</title>
      </Head>
    </ConfigProvider>
  );
}
function AuthComponent() {
  const { data: session } = useSession();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // 检查会话是否存在并设置登录状态
    if (session) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [session]);
  if (loggedIn) {
    return <Notification />;
  }
  return null;
}

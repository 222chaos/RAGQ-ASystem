import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, theme } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { SessionProvider, useSession } from 'next-auth/react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import ProLayout from '../components/Layout';
import '../styles/globals.css';

export const ThemeContext = createContext<{
  themeMode: string;
  setThemeMode: (mode: string) => void;
}>({
  themeMode: 'light',
  setThemeMode: () => {},
});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { themeMode, setThemeMode } = useContext(ThemeContext);

  useEffect(() => {
    // 检查当前路径是否为认证相关页面
    const isAuthPage = router.pathname.startsWith('/auth');

    // 只在状态为未认证且不在认证页面时重定向
    if (status === 'unauthenticated' && !isAuthPage) {
      router.push('/auth/login');
    }
    // 如果用户已登录且在认证页面，则重定向到首页
    else if (status === 'authenticated' && isAuthPage) {
      router.push('/');
    }
  }, [router, status]);

  // 如果是认证页面，不显示布局
  if (router.pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  // 如果未认证，不显示内容
  if (status === 'unauthenticated') {
    return null;
  }

  return <ProLayout>{children}</ProLayout>;
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [themeMode, setThemeMode] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <ConfigProvider
        theme={{
          algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: themeMode === 'dark' ? 'rgb(235, 47, 150)' : 'rgb(22,119,255)',
          },
        }}
      >
        <SessionProvider session={session}>
          <AnimatePresence>
            <AuthWrapper>
              <Component {...pageProps} />
              <Button
                type="primary"
                ghost={themeMode === 'dark'}
                icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                style={{
                  position: 'fixed',
                  top: '8px',
                  right: '4px',
                  zIndex: 1000,
                }}
                onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              />
            </AuthWrapper>
          </AnimatePresence>
        </SessionProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

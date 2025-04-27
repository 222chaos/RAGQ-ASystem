// _app.jsx
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, theme } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { SessionProvider } from 'next-auth/react';
import { createContext, useEffect, useState } from 'react';
import ProLayout from '../components/Layout';
import '../styles/globals.css';

export const ThemeContext = createContext();

export default function App({ Component, pageProps }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: isDark ? 'rgb(235, 47, 150)' : 'rgb(22,119,255)',
          },
        }}
      >
        <SessionProvider session={pageProps.session}>
          <AnimatePresence>
            <ProLayout>
              <Component {...pageProps} />
              <Button
                type="primary"
                ghost={isDark}
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  zIndex: 1000,
                }}
                onClick={() => setIsDark(!isDark)}
              />
            </ProLayout>
          </AnimatePresence>
        </SessionProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

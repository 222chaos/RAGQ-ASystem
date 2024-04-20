// _app.jsx
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, theme } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { SessionProvider } from 'next-auth/react';
import { createContext, useEffect, useState } from 'react';
import '../styles/globals.css';

export const ThemeContext = createContext();

export default function App({ Component, pageProps }) {
  const [themeMode, setThemeMode] = useState('dark');

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
        <SessionProvider session={pageProps.session}>
          <AnimatePresence>
            <Component {...pageProps} />
            <Button
              type="primary"
              ghost={themeMode === 'dark'}
              icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
              }}
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            />
          </AnimatePresence>
        </SessionProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

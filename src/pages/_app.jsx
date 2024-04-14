import { ConfigProvider, theme } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';

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
        <AnimatePresence>
          <Component {...pageProps} />
        </AnimatePresence>
      </SessionProvider>
    </ConfigProvider>
  );
}

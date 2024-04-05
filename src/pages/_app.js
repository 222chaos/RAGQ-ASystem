import '../styles/globals.css';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ConfigProvider, theme } from 'antd';

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
      </SessionProvider>{' '}
    </ConfigProvider>
  );
}

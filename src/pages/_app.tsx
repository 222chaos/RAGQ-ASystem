import { SessionProvider, useSession } from 'next-auth/react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ProLayout from '../components/Layout';
import '../styles/globals.css';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // 如果正在加载认证状态，显示加载中
  if (status === 'loading') {
    return <div>加载中...</div>;
  }

  // 如果未认证，不显示内容
  if (status === 'unauthenticated') {
    return null;
  }

  return <ProLayout>{children}</ProLayout>;
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AuthWrapper>
        <Component {...pageProps} />
      </AuthWrapper>
    </SessionProvider>
  );
}

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const sql = neon(process.env.DATABASE_URL!);

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    type: 'student' | 'teacher' | 'admin';
  }
  interface Session {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
        type: { label: '用户类型', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('请输入用户名和密码');
        }

        try {
          const result = await sql`
            SELECT id, username, password, type
            FROM users
            WHERE username = ${credentials.username}
          `;

          const user = result[0];
          if (!user) {
            throw new Error('用户名或密码错误');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('用户名或密码错误');
          }

          if (user.type !== credentials.type) {
            throw new Error('用户名或密码错误');
          }

          return {
            id: user.id,
            username: user.username,
            type: user.type,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('登录失败');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.type = token.type as 'student' | 'teacher' | 'admin';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 从 URL 中获取用户类型
      const params = new URLSearchParams(url.split('?')[1]);
      const type = params.get('type');

      // 如果是管理员，重定向到 dashboard
      if (type === 'admin') {
        return `${baseUrl}/dashboard`;
      }
      // 其他用户重定向到首页
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

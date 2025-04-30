import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const sql = neon(process.env.DATABASE_URL!);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
        type: { label: '用户类型', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password || !credentials?.type) {
          throw new Error('请提供用户名、密码和用户类型');
        }

        try {
          const result = await sql`
            SELECT id, username, password, type 
            FROM users 
            WHERE username = ${credentials.username}
          `;

          if (!result || result.length === 0) {
            throw new Error('用户不存在');
          }

          const user = result[0];

          if (user.type !== credentials.type) {
            throw new Error(`请使用${user.type === 'student' ? '学生' : '教师'}账号登录`);
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('密码错误');
          }

          return {
            id: user.id.toString(),
            username: user.username,
            type: user.type,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('认证失败');
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type as 'student' | 'teacher';
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

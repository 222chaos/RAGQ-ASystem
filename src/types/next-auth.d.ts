import 'next-auth';

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

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    type: 'student' | 'teacher' | 'admin';
  }
}

import { Button } from 'antd';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Component() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 4,
      }}
    >
      <AuthComponent />
    </div>
  );
}

function AuthComponent() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <Button onClick={() => signOut()}>Sign out</Button>&nbsp;&nbsp;&nbsp;
      </>
    );
  }
  return (
    <>
      <Button onClick={() => signIn()}>Sign in</Button>
      &nbsp;&nbsp;&nbsp;
    </>
  );
}

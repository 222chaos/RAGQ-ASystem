import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { Button } from "antd";
import React from "react";

export default function Component() {
  return (
    <SessionProvider>
      <AuthComponent />
    </SessionProvider>
  );
}

function AuthComponent() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Welcome, {session.user.name}! <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </>
    );
  }
  return (
    <>
      Please sign in <br />
      <Button onClick={() => signIn()}>Sign in</Button>
    </>
  );
}

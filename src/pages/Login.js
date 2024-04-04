import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
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
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}

import { Button } from 'antd';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Notification from './Notification';

export default function Component() {
  const [notificationShown, setNotificationShown] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const storedNotificationShown = sessionStorage.getItem('notificationShown');
    if (session && !storedNotificationShown) {
      setNotificationShown(true);
      sessionStorage.setItem('notificationShown', 'true');
    } else if (!session && storedNotificationShown) {
      setNotificationShown(false);
      sessionStorage.removeItem('notificationShown');
    }
  }, [session]);

  const handleSignOut = () => {
    signOut();
    setNotificationShown(false); // Reset notification state on sign out
    sessionStorage.removeItem('notificationShown');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 4,
      }}
    >
      <AuthComponent
        session={session}
        notificationShown={notificationShown}
        setNotificationShown={setNotificationShown}
        handleSignOut={handleSignOut}
      />
    </div>
  );
}

function AuthComponent({ session, notificationShown, setNotificationShown, handleSignOut }) {
  const handleSignIn = () => {
    signIn();
    setNotificationShown(true);
    sessionStorage.setItem('notificationShown', 'true');
  };

  if (session) {
    return (
      <>
        <Button onClick={handleSignOut}>Sign out</Button>&nbsp;&nbsp;&nbsp;
        {notificationShown && <Notification />}
      </>
    );
  }

  return (
    <>
      <Button onClick={handleSignIn}>Sign in</Button>
      &nbsp;&nbsp;&nbsp;
    </>
  );
}

import { notification } from 'antd';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const Context = React.createContext({
  name: 'Default',
});

const Notification = () => {
  const [api, contextHolder] = notification.useNotification();
  const { data: session } = useSession();
  const [notificationShown, setNotificationShown] = useState(false);

  useEffect(() => {
    if (session && !notificationShown) {
      api.success({
        message: '登录成功',
        description: `你好, ${session.user.name}!`,
        placement: 'bottomRight',
      });
      setNotificationShown(true);
    }
  }, [session, notificationShown, api]);

  return <Context.Provider>{contextHolder}</Context.Provider>;
};

export default Notification;

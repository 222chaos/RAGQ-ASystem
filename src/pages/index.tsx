import React, { useState, useEffect } from 'react';
import Carousel from './Carousel';
import Prochat from './Prochat';
import Notification from './Notification';
import Login from './Login';
import WelcomePage from './WelcomePage';
import { useSession } from 'next-auth/react';

const IndexPage = () => {
  const { data: session, status } = useSession();
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setLoggedIn(true);
      setLoading(true);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status]);

  return (
    <div>
      <Notification />
      {!loading && !clicked && loggedIn && (
        <>
          <Login />
          <Carousel
            setClicked={setClicked}
            setSelectedImageInfo={setSelectedImageInfo}
          />
        </>
      )}
      {clicked && (
        <Prochat
          setClicked={setClicked}
          selectedImageInfo={selectedImageInfo}
          setClick={undefined}
        />
      )}
      {!loggedIn && !loading && <WelcomePage />}
    </div>
  );
};

export default IndexPage;

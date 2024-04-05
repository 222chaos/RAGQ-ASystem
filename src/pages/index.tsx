import React, { useState, useEffect } from 'react';
import Carousel from './Carousel';
import Prochat from './Prochat';
import Notification from './Notification';
import Login from './Login';
import WelcomePage from './WelcomePage';
import { useSession } from 'next-auth/react';
const IndexPage = () => {
  const { data: session } = useSession();
  const [click, setClick] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    if (session) {
      setLoggedIn(true);
    }
  }, [session]);
  return (
    <div>
      <Notification />
      {!clicked && (
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
      {!click && !clicked && !loggedIn && <WelcomePage setClick={setClick} />}
    </div>
  );
};

export default IndexPage;

import React, { useState } from "react";
import { Button, notification } from "antd";
import Carousel from "./Carousel";
import Prochat from "./Prochat";
import NotificationComponent from "./Notification";

import WelcomePage from "./WelcomePage";

const IndexPage = () => {
  const [click, setClick] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);

  return (
    <div>
      {click && !clicked && (
        <>
          <h1
            style={{
              fontFamily: "Impact, sans-serif",
              color: "darkred",
              textTransform: "uppercase",
              textAlign: "left",
              fontSize: "4em",
              paddingLeft: "8vw",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Reading Helper
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
            }}
          >
            <Carousel
              setClicked={setClicked}
              setSelectedImageInfo={setSelectedImageInfo}
            />
          </div>
        </>
      )}
      {clicked && (
        <Prochat
          setClicked={setClicked}
          selectedImageInfo={selectedImageInfo}
        />
      )}
      {!click && !clicked && <WelcomePage setClick={setClick} />}
    </div>
  );
};

export default IndexPage;

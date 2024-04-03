import React, { useState } from "react";
import { Button, notification } from "antd";
import CenterMode from "./Carousel";
import Prochat from "./Prochat";
import Notification from "./Notification";

import WelcomePage from "./WelcomePage";

const IndexPage = () => {
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  const [click, setClick] = useState(false);

  return (
    <div>
      {click ? (
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
            <CenterMode
              setClicked={setClicked}
              setSelectedImageInfo={setSelectedImageInfo}
            />
          </div>
        </>
      ) : (
        <WelcomePage setClick={setClick} />
      )}
      {clicked && (
        <Prochat
          setClicked={setClicked}
          selectedImageInfo={selectedImageInfo}
        />
      )}
    </div>
  );
};

export default IndexPage;

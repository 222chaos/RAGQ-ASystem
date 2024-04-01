import React, { useState } from "react";
import { Button } from "antd";
import CenterMode from "./Carousel";
import Prochat from "./Prochat";

const IndexPage = () => {
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);

  return (
    <div>
      {clicked ? (
        <Prochat
          setClicked={setClicked}
          selectedImageInfo={selectedImageInfo}
        />
      ) : (
        <>
          <h1></h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CenterMode
              setClicked={setClicked}
              setSelectedImageInfo={setSelectedImageInfo}
            />
          </div>
        </>
      )}
    </div>
  );
};
export default IndexPage;

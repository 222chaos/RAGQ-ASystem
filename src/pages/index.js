import React, { useState } from "react";
import CenterMode from "./Carousel";
import Prochat from "./Prochat";

const IndexPage = () => {
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  console.log("selectedImageInfo==", selectedImageInfo);
  return (
    <div>
      {clicked ? (
        <div></div>
      ) : (
        <h1 style={{ marginLeft: "20px", position: "absolute" }}>帮你读</h1>
      )}
      {clicked ? (
        <Prochat
          setClicked={setClicked}
          selectedImageInfo={selectedImageInfo}
        />
      ) : (
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
      )}
    </div>
  );
};
export default IndexPage;

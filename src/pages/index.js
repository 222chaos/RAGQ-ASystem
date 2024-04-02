import React, { useState } from "react";
import { Button } from "antd";
import CenterMode from "./Carousel";
import Prochat from "./Prochat";

const IndexPage = () => {
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // 控制浮窗显示与隐藏的状态

  return (
    <div>
      {showPopup && ( // 根据 showPopup 状态决定是否显示浮窗
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
          }}
        >
          <h2>这是一个浮窗</h2>
          <button onClick={() => setShowPopup(false)}>关闭</button>
        </div>
      )}
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
          <Button onClick={() => setShowPopup(true)}>显示浮窗</Button>{" "}
        </>
      )}
    </div>
  );
};
export default IndexPage;

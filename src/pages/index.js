import React, { useState } from "react";
import { Button } from "antd";
import CenterMode from "./Carousel";
import Prochat from "./Prochat";

const IndexPage = () => {
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  const handleContentSubmit = async () => {
    try {
      const res = await fetch("/api/ow", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log(data);
      console.log("开始上传");
    } catch (error) {
      console.error("内容上传请求出错:", error);
    }
  };

  return (
    <div>
      {clicked ? (
        <div></div>
      ) : (
        <div style={{ position: "relative" }}>
          <h1 style={{ marginLeft: "20px", position: "absolute" }}>帮你读</h1>
          <div style={{ position: "fixed", bottom: 20, right: 20 }}>
            <Button type="primary" onClick={handleContentSubmit}>
              提交1
            </Button>
          </div>
        </div>
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

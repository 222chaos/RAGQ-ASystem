import React, { useState } from "react";
import { Button } from "antd";
import CenterMode from "./Carousel";
import Prochat from "./Prochat";

const IndexPage = () => {
  const [clicked, setClicked] = useState(false);
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  /*  const handleContentSubmit = async () => {
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
*/
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

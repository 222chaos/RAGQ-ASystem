import React, { useState } from "react";
import { Button, Input, Carousel } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const utf8Decoder = new TextDecoder("utf-8");

const IndexPage = () => {
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("......");
  const [array, setArray] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [showBookCovers, setShowBookCovers] = useState(false);

  const handleQuerySubmit = async () => {
    setResponse("");
    let tempText = "";

    const requestData = {
      query: query,
      array: array,
    };
    try {
      const queryRes = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      const reader = queryRes.body.getReader();

      const processData = ({ done, value: chunk }) => {
        if (done) {
          console.log("Stream finished");
          return;
        }
        setResponse((response) => {
          return response + utf8Decoder.decode(chunk, { stream: true });
        });

        tempText += utf8Decoder.decode(chunk, { stream: true });

        return reader.read().then(processData);
      };
      await processData(await reader.read());
    } catch (error) {
      console.log(error);
      console.error("内容上传请求出错:", error);
    }
  };

  const handleShowBookCovers = () => {
    setShowBookCovers(true);
  };

  const handleHideBookCovers = () => {
    setShowBookCovers(false);
  };
  const images = [
    "https://www.manongbook.com/d/file/other/19e88c4f255361cf57b1b8bea1ea11560.jpg",
    "https://static.file123.info:8443/covers/s/9787040417142.jpg",
  ];
  return (
    <div>
      {showBookCovers ? (
        <div>
          <Carousel afterChange={(currentSlide) => console.log(currentSlide)}>
            <div>
              <h3 style={contentStyle}>
                <img
                  src="https://www.manongbook.com/d/file/other/19e88c4f255361cf57b1b8bea1ea11560.jpg"
                  style={imageStyle}
                ></img>
              </h3>
            </div>
            <div>
              <h3 style={contentStyle}>
                <img
                  src="https://static.file123.info:8443/covers/s/9787040417142.jpg"
                  style={imageStyle}
                ></img>
              </h3>
            </div>
            <div>
              <h3 style={contentStyle}>3</h3>
            </div>
            <div>
              <h3 style={contentStyle}>4</h3>
            </div>
          </Carousel>

          <Button onClick={handleHideBookCovers}>返回</Button>
        </div>
      ) : (
        <div>
          <div style={{ marginLeft: "20px" }}>
            <h1>帮你读</h1>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginTop: "250px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Input
                  type="text"
                  size="large"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="请输入查询内容"
                  style={{ width: "750px", height: "50px" }}
                  disabled={uploading}
                />
                <Button
                  style={{ height: "50px", width: "75px", marginLeft: "10px" }}
                  onClick={handleQuerySubmit}
                  type="primary"
                  disabled={uploading}
                >
                  查询
                </Button>
              </div>
            </div>
            <div>
              <h2>结果：</h2>
              <div>{response}</div>
            </div>
            <Button onClick={handleShowBookCovers}>展示封面</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const contentStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: 0,
  height: "98vh",
  color: "#fff",
  textAlign: "center",
  background: "#364d79",
};
const imageStyle = {
  width: "50vh",
  height: "auto",
};
export default IndexPage;

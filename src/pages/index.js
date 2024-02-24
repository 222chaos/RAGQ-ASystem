import React, { useState } from "react";
import { Button, Input, Menu } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const utf8Decoder = new TextDecoder("utf-8");

const IndexPage = () => {
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("......");
  const [array, setArray] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("upload");
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

  const menuItemClickHandler = async (item) => {
    setSelectedMenuItem(item.key);

    try {
      if (filePath) {
        setUploading(true);
        const response = await fetch(filePath);
        const contentBuffer = await response.arrayBuffer();
        const content = utf8Decoder.decode(contentBuffer);
        setText(content);
        const aiRes = await fetch("/api/ai", {
          method: "POST",
          body: JSON.stringify({ content: text }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const aiData = await aiRes.json();
        setArray(aiData);
      }
    } catch (error) {
      console.error("读取文件或调用api/ai出错:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleShowBookCovers = () => {
    setShowBookCovers(true);
  };

  const handleHideBookCovers = () => {
    setShowBookCovers(false);
  };

  return (
    <div>
      {showBookCovers ? (
        <BookCoverDisplay onHideBookCovers={handleHideBookCovers} />
      ) : (
        <div>
          <Menu
            mode="horizontal"
            style={{ textAlign: "center" }}
            selectedKeys={[selectedMenuItem]}
            onClick={menuItemClickHandler}
          ></Menu>

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

const BookCoverDisplay = ({ onHideBookCovers }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "https://www.manongbook.com/d/file/other/19e88c4f255361cf57b1b8bea1ea11560.jpg",
    "https://static.file123.info:8443/covers/s/9787040417142.jpg",
  ];

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: "black",
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h2 style={{ color: "white" }}>书籍封面</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          overflowX: "hidden",
          alignItems: "center",
          height: "calc(100% - 160px)",
        }}
      >
        {[...Array(5)].map((_, index) => {
          const imgIndex =
            (currentImageIndex + index - 2 + images.length) % images.length;
          return (
            <img
              key={index}
              src={images[imgIndex]}
              alt={`Book Cover ${imgIndex}`}
              style={{
                maxWidth: index === 2 ? "500px" : "200px",
                maxHeight: index === 2 ? "600px" : "300px",
                opacity: index === 2 ? 1 : 0.5,
              }}
            />
          );
        })}
      </div>
      <br />
      <div>
        <button
          style={{
            float: "left",
            backgroundColor: "white",
            color: "black",
            borderRadius: "5px",
            padding: "5px 10px",
            margin: "5px",
          }}
          onClick={handlePrevious}
        >
          上一个
        </button>
        <button
          style={{
            float: "right",
            backgroundColor: "white",
            color: "black",
            borderRadius: "5px",
            padding: "5px 10px",
            margin: "5px",
          }}
          onClick={handleNext}
        >
          下一个
        </button>
      </div>
      <br />
      <button
        style={{
          backgroundColor: "white",
          color: "black",
          borderRadius: "5px",
          padding: "5px 10px",
          marginTop: "20px",
        }}
        onClick={onHideBookCovers}
      >
        返回
      </button>
    </div>
  );
};

export default IndexPage;

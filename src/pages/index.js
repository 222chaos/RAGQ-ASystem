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
    "https://pic.vjshi.com/2019-12-31/07c5372ebaf9b4621f7641ccb99bec9b/00001.jpg?x-oss-process=style/watermark",
    "https://desk-fd.zol-img.com.cn/t_s960x600c5/g5/M00/02/05/ChMkJ1bKyU2IG8KRAAT_NkosRHwAALIMALHqVcABP9O282.jpg",
    "https://desk-fd.zol-img.com.cn/t_s960x600c5/g5/M00/02/05/ChMkJ1bKyU2IG8KRAAT_NkosRHwAALIMALHqVcABP9O282.jpg",
    "https://desk-fd.zol-img.com.cn/t_s960x600c5/g5/M00/02/05/ChMkJ1bKyU2IG8KRAAT_NkosRHwAALIMALHqVcABP9O282.jpg",
    "https://pic.vjshi.com/2019-12-31/07c5372ebaf9b4621f7641ccb99bec9b/00001.jpg?x-oss-process=style/watermark",
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
          justifyContent: "center",
          overflowX: "hidden",
          alignItems: "center",
          height: "calc(100% - 160px)",
        }}
      >
        {[...images, ...images, ...images].map((image, index) => {
          let adjustedIndex = index - currentImageIndex;
          if (adjustedIndex < 0) adjustedIndex += images.length;
          if (adjustedIndex >= images.length) adjustedIndex -= images.length;
          return (
            <img
              key={index}
              src={image}
              alt={`Book Cover ${index}`}
              style={{
                maxWidth:
                  adjustedIndex === Math.floor(images.length / 2)
                    ? "600px"
                    : "200px",
                maxHeight:
                  adjustedIndex === Math.floor(images.length / 2)
                    ? "700px"
                    : "300px",
                marginLeft: "20px",
                transition: "all 0.5s ease",
                transform: `translateX(${-currentImageIndex * 220}px)`,
                opacity:
                  adjustedIndex === Math.floor(images.length / 2) ? 1 : 0.5,
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

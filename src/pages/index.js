import React, { useState } from "react";
import { Button, Input, Menu } from "antd";

import SimpleSlider from "./Carousel";
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

const BookCoverDisplay = () => {
  const images = [
    "https://blognumbers.files.wordpress.com/2010/09/1.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/2.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/3.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/4.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/5.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/6.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/7.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/9.jpg",
  ];

  return (
    <div>
      <h2>书籍封面</h2>

      <SimpleSlider />
    </div>
  );
};
export default IndexPage;

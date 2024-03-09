import React, { useState } from "react";
import { Button, Input, Menu } from "antd";

import CenterMode from "./Carousel";
const { TextArea } = Input;
const utf8Decoder = new TextDecoder("utf-8");

const IndexPage = () => {
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("......");
  const [array, setArray] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div>
      <div>
        <div style={{ marginLeft: "20px" }}>
          <h1>帮你读</h1>
          <>
            <CenterMode />
          </>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              marginTop: "100px",
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
        </div>
      </div>
    </div>
  );
};

export default IndexPage;

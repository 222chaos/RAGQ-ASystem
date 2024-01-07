import React, { useState } from "react";
import { Button, Input } from "antd";

const { TextArea } = Input;
const utf8Decoder = new TextDecoder("utf-8");
const IndexPage = () => {
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("...");
  const [array, setArray] = useState([]);

  const handleContentSubmit = async () => {
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("array=====>", data);
      setArray(data);
    } catch (error) {
      console.error("内容上传请求出错:", error);
    }
  };

  const handleQuerySubmit = async () => {
    setResponse("");
    let tempText = "";
    console.log("array==>", array);
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
      <h1>################</h1>
      <div style={{ margin: "auto", width: "50%", textAlign: "center" }}>
        <TextArea
          showCount
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请上传内容"
          style={{ height: 120, resize: "none" }}
        />
        <br />
        <br />
        <Button
          style={{ height: "50px", width: "300px" }}
          onClick={handleContentSubmit}
          type="primary"
        >
          上传
        </Button>
      </div>
      <br />
      <br />
      <div
        style={{
          margin: "auto",
          width: "50%",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请输入查询内容"
          style={{ width: "100%", height: "50px" }}
        />
        <br />
        <br />
        <Button
          style={{ height: "50px", width: "300px" }}
          onClick={handleQuerySubmit}
          type="primary"
        >
          查询
        </Button>
      </div>
      <div>
        <h2>结果：</h2>
        <div>{response}</div>
      </div>
    </div>
  );
};

export default IndexPage;

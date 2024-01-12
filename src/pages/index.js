import React, { useState } from "react";
import { Button, Input, Menu } from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  NumberOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const utf8Decoder = new TextDecoder("utf-8");

const IndexPage = () => {
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("...");
  const [array, setArray] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("upload");

  const handleContentSubmit = async () => {
    try {
      setUploading(true);
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setArray(data);

      setResponse("上传已完成");

      setTimeout(() => {
        setResponse("");
      }, 2000);
    } catch (error) {
      console.error("内容上传请求出错:", error);
    } finally {
      setUploading(false);
    }
  };

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

  const menuItemClickHandler = (item) => {
    setSelectedMenuItem(item.key);
  };

  return (
    <div>
      <Menu
        mode="horizontal"
        style={{ textAlign: "center" }}
        selectedKeys={[selectedMenuItem]}
        onClick={menuItemClickHandler}
      >
        <Menu.SubMenu key="freshman" icon={<SearchOutlined />} title="大一">
          <Menu.Item key="freshiman1">课程1</Menu.Item>
          <Menu.Item key="freshiman2">课程2</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="sophomore" icon={<SearchOutlined />} title="大二">
          <Menu.Item key="sophomore1">课程1</Menu.Item>
          <Menu.Item key="sophomore2">课程2</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="junior" icon={<SearchOutlined />} title="大三">
          <Menu.Item key="junior1">课程1</Menu.Item>
          <Menu.Item key="junior2">课程2</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="senior" icon={<SearchOutlined />} title="大四">
          <Menu.Item key="senior1">课程1</Menu.Item>
          <Menu.Item key="senior2">课程2</Menu.Item>
        </Menu.SubMenu>
      </Menu>

      <div style={{ marginLeft: "220px" }}>
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
            disabled={uploading}
          />
          <br />
          <br />
          <Button
            style={{ height: "50px", width: "300px" }}
            onClick={handleQuerySubmit}
            type="primary"
            disabled={uploading}
          >
            查询
          </Button>
        </div>
        <div>
          <h2>结果：</h2>
          <div>{response}</div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;

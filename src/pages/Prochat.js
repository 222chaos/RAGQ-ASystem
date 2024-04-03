import { useState, useEffect } from "react";
import { ProChat } from "@ant-design/pro-chat";
import { Button } from "antd";
import { useTheme } from "antd-style";
import { LeftOutlined } from "@ant-design/icons";
import React from "react";

export default function Prochat({ setClick, setClicked, selectedImageInfo }) {
  const theme = useTheme();
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => setShowComponent(true), []);

  const handleReturn = () => {
    setClicked(false);
  };

  return (
    <div
      style={{
        backgroundColor: theme.colorBgLayout,
      }}
    >
      <div style={{ position: "fixed", top: "4px", left: "8px", zIndex: 999 }}>
        <Button
          style={{
            position: "absolute",
            left: "8px",
          }}
          onClick={handleReturn}
        >
          <LeftOutlined />
        </Button>
      </div>

      {showComponent && (
        <ProChat
          style={{
            height: "100vh",
            width: "100vw",
          }}
          helloMessage={`欢迎使用帮你读，你将要查询的科目是 ${selectedImageInfo} ，请输入需要查询的内容。`}
          request={async (messages) => {
            const requestBody = {
              query: messages,
              selectedImageInfo: selectedImageInfo,
            };
            const response = await fetch("/api/query", {
              method: "POST",
              body: JSON.stringify(requestBody),
            });

            return response;
          }}
        />
      )}
    </div>
  );
}

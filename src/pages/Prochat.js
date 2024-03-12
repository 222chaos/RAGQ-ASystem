import { useState, useEffect } from "react";
import { ProChat } from "@ant-design/pro-chat";
import { Button } from "antd";
import { useTheme } from "antd-style";
import React from "react";
export default function Prochat({ setClicked }) {
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
      <div
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 999 }}
      >
        <Button
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
          }}
          onClick={handleReturn}
        >
          返回
        </Button>
      </div>
      {showComponent && (
        <ProChat
          style={{
            height: "100vh",
            width: "100vw",
          }}
          helloMessage={
            "欢迎使用 ProChat ，我是你的专属机器人，这是我们的 Github：[ProChat](https://github.com/ant-design/pro-chat)"
          }
          request={async (messages) => {
            const mockedData = `这是一段模拟的对话数据。本次会话传入了${messages.length}条消息`;
            return new Response(mockedData);
          }}
        />
      )}
    </div>
  );
}

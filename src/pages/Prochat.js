import { useState, useEffect } from "react";
import { ProChat } from "@ant-design/pro-chat";
import { Button } from "antd";
import { useTheme } from "antd-style";
import { LeftOutlined } from "@ant-design/icons";
import React from "react";

export default function Prochat({ setClicked }) {
  const theme = useTheme();
  const [showComponent, setShowComponent] = useState(false);
  useEffect(() => setShowComponent(true), []);

  const handleReturn = () => {
    setClicked(false);
  };

  const sendMessage = async (messages) => {
    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.colorBgLayout,
      }}
    >
      <div style={{ position: "fixed", top: "8px", left: "8px", zIndex: 999 }}>
        <Button
          style={{
            position: "absolute",
            top: "8px",
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
          helloMessage={"欢迎使用 帮你读 ，我是你的专属机器人，这"}
          request={sendMessage}
        />
      )}
    </div>
  );
}

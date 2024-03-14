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
          helloMessage={
            "欢迎使用 帮你读 ，我是你的专属机器人，你将要查询的科目是{。。。}，请输入需要查询的内容。"
          }
          request={async (messages) => {
            try {
              const embedding = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: messages,
                encoding_format: "float",
              });
              const embeddingData = embedding.data[0].embedding;

              const client = new QdrantClient({
                url: process.env.QDRANT_URL,
                apiKey: process.env.QDRANT_APIKEY,
              });
              const collectionName = "test_collection";
              const res1 = await client.search(collectionName, {
                vector: embeddingData,
                limit: 1,
              });

              const encoder = new TextEncoder();
              const stream = new ReadableStream({
                async start(controller) {
                  try {
                    const chatData = await openai.chat.completions.create({
                      model: "gpt-3.5-turbo",
                      messages: [
                        {
                          role: "user",
                          content: `\n
                            问题："""${messages}"""
                            可能的答案:"""${JSON.stringify(content)}"""
                            \n
                            基于以上的问题和可能的答案总结一个得体并且言简意骇的回答，只需要输出回答即可。
                            例如：
                              > 在.umijs.js中无法使用require.context，因为.umijs.js不是在浏览器环境下运行，而是通过node的fs进行处理。
                        `,
                        },
                      ],
                      temperature: 1,
                      frequency_penalty: 0,
                      presence_penalty: 0,
                      max_tokens: 2000,
                      stream: true,
                    });

                    for await (const part of chatData) {
                      controller.enqueue(
                        encoder.encode(part.choices[0]?.delta?.content || "")
                      );
                    }
                    // 完成后，关闭流
                    controller.close();
                  } catch (e) {
                    // 如果在执行过程中发生错误，向流发送错误
                    controller.error(e);
                  }
                },
              });

              return new Response(stream);
            } catch (error) {
              console.log(error);
              const res = new Response(
                JSON.stringify({
                  message: "Internal server error" + error.message,
                }),
                {
                  status: 500,
                }
              );
              return res;
            }
          }}
        />
      )}
    </div>
  );
}

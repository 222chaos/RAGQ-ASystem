// use-client

import { ProChat } from '@ant-design/pro-chat';
import { useTheme } from 'antd-style';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { imageInfoList } from '../Carousel';
import { Badge, Button, Result, Space, Tag } from 'antd';

export default function ChatPage() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();

  if (!params?.title) {
    return null;
  }

  const selectedImageInfo = imageInfoList.find(
    (imageInfo) => imageInfo.title === params.title,
  );

  if (!selectedImageInfo) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="未找到页面"
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            返回主页
          </Button>
        }
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: theme.colorBgLayout,
      }}
    >
      <ProChat
        style={{
          height: '100vh',
          width: '100vw',
        }}
        styles={{
          chatInputAction: {
            justifyContent: 'start',
            padding: 8,
          },
        }}
        actionsRender={() => (
          <Button
            color="volcano"
            size="small"
            style={{
              marginRight: 8,
              padding: 2,
            }}
            onClick={() => router.push('/use')}
            type="primary"
          >
            重新选择科目
          </Button>
        )}
        chatItemRenderConfig={{
          actionsRender: () => <Tag>重新选择科目</Tag>,
        }}
        helloMessage={`欢迎使用帮你读，你将要查询的科目是 ${selectedImageInfo.title} ，请输入需要查询的内容。`}
        sendMessageRequest={async (messages) => {
          const requestBody = {
            query: messages,
            selectedImageInfo: selectedImageInfo.title,
          };
          const response = await fetch('/api/query', {
            method: 'POST',
            body: JSON.stringify(requestBody),
          });

          return response;
        }}
      />
    </div>
  );
}

import React from 'react';
import { Button, ConfigProvider, Flex, Space, theme } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const WelcomePage = () => {
  const { token } = theme.useToken();
  const router = useRouter();
  return (
    <Flex
      vertical
      style={{
        height: '100vh',
        padding: 32,
        maxHeight: 600,
      }}
      align="center"
      justify="center"
    >
      <Flex vertical align="center" justify="center">
        <Flex vertical align="center">
          <div className="heroBlurBall"></div>
          <div
            style={{
              maxWidth: 600,
            }}
          >
            <h1
              style={{
                fontSize: '4rem',
                marginBottom: '4rem',
                color: token.colorTextHeading,
                textAlign: 'center',
              }}
            >
              欢迎来到帮你读
            </h1>
            <h2
              style={{
                marginBottom: '22px',
                textAlign: 'center',
                color: token.colorText,
              }}
            >
              帮你读是一个
              RAG应用，使用检索增强生成技术，可以帮助您更轻松地获取相关信息。点击主页上的书籍封面图片，进入
              ProChat
              对话组件。在对话框中输入问题或主题，机器人将回答您的问题或提供相关信息。
            </h2>
          </div>
        </Flex>
        <Space
          style={{
            marginTop: token.marginLG,
          }}
          size={32}
        >
          <Button
            type="primary"
            onClick={() => {
              router.push('/use');
            }}
            className="actionButton"
            size="large"
            style={{ margin: '0 auto' }}
          >
            立即体验 →
          </Button>
          <Button
            size="large"
            icon={<GithubOutlined />}
            onClick={() => {
              window.open(
                'https://github.com/microappteam/book-read-ai',
                '_blank',
              );
            }}
            style={{ margin: '0 auto' }}
          >
            GITHUB
          </Button>
        </Space>
      </Flex>
    </Flex>
  );
};

export default (props) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: 'rgb(235, 47, 150)',
        },
      }}
    >
      <WelcomePage {...props} />
    </ConfigProvider>
  );
};

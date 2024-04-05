import React from 'react';
import { Button } from 'antd';
import { motion } from 'framer-motion';

const WelcomePage = ({ setClick }) => {
  const handleClick = () => {
    setClick(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          background: `url(/background6.jpg)`,
          backgroundSize: 'cover',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginLeft: '2rem' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '4rem' }}>
            欢迎来到帮你读
          </h1>
          <h2 style={{ marginBottom: '3rem' }}>Q：什么是帮你读？</h2>
          <h2 style={{ marginBottom: '4rem' }}>
            A：帮你读是一个
            RAG应用，使用检索增强生成技术，可以帮助您更轻松地获取相关信息。
          </h2>
          <h2 style={{ marginBottom: '3rem' }}>Q：如何使用帮你读？</h2>
          <h2 style={{ marginBottom: '3rem' }}>
            A：点击主页上的书籍封面图片，进入 ProChat
            对话组件。在对话框中输入问题或主题，机器人将回答您的问题或提供相关信息。
          </h2>
        </div>
        <Button
          type="primary"
          size="large"
          style={{ margin: '0 auto', width: '20vw' }}
          onClick={handleClick}
        >
          立即体验
        </Button>
      </motion.div>
    </>
  );
};

export default WelcomePage;

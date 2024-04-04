import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';

const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const handleOk = () => {
    setModalOpen(false);
  };
  const handleCancel = () => {
    setModalOpen(false);
  };
  useEffect(() => {
    setModalOpen(true);
  }, []);

  return (
    <>
      <Modal
        title="使用说明"
        centered
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        点击主页上的书籍封面图片，进入ProChat对话组件。在对话框中输入问题或主题，机器人将回答您的问题或提供相关信息。
      </Modal>
    </>
  );
};

export default App;

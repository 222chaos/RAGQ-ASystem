import React from "react";
import { useSpring, animated } from "react-spring";
import { Button } from "antd";

const calc = (x, y) => [
  -(y - window.innerHeight / 2) / 2000,
  (x - window.innerWidth / 2) / 2000,
  1,
];
const trans = (x, y, s) =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

const WelcomePage = ({ setClick }) => {
  const [props, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  const handleClick = () => {
    setClick(true); // 点击按钮后设置 click 状态为 true
  };

  return (
    <animated.div
      style={{
        transform: props.xys.interpolate(trans),
        background: `url(/background6.jpg)`,
        backgroundSize: "cover",
        height: "100vh",
        color: "#ffffff", // 统一字体颜色
        display: "flex",
        alignItems: "flex-start", // 垂直居顶对齐
        justifyContent: "flex-start", // 水平居左对齐
        flexDirection: "column",
        padding: "2rem", // 添加内边距
      }}
      onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
      onMouseLeave={() => set({ xys: [0, 0, 1] })}
    >
      <div style={{ marginLeft: "2rem" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "4rem" }}>
          欢迎来到帮你读
        </h1>
        <h2 style={{ marginBottom: "3rem" }}>Q:帮你读是什么？</h2>
        <h2 style={{ marginBottom: "4rem" }}>
          A：帮你读是一个
          RAG应用，使用检索增强生成技术，可以帮助您更轻松地获取相关信息。
        </h2>
        <h2 style={{ marginBottom: "3rem" }}>Q：如何使用帮你读？</h2>
        <h2 style={{ marginBottom: "3rem" }}>
          A：点击主页上的书籍封面图片，进入 ProChat
          对话组件。在对话框中输入问题或主题，机器人将回答您的问题或提供相关信息。
        </h2>
      </div>
      <Button
        type="primary"
        size="large"
        style={{ margin: "0 auto", width: "20vw" }}
        onClick={handleClick} // 添加点击事件处理程序
      >
        立即体验
      </Button>
    </animated.div>
  );
};

export default WelcomePage;

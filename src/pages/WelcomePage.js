import React from "react";
import { useSpring, animated } from "react-spring";
import { Button, Skeleton } from "antd";

const calc = (x, y) => [
  -(y - window.innerHeight / 2) / 3000,
  (x - window.innerWidth / 2) / 3000,
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
    setClick(true);
  };

  return (
    <>
      <animated.div
        style={{
          maxHeight: "90vh",
          overflow: "auto",
          margin: 8,
          transform: props.xys.interpolate(trans),
          background: `url(/background6.jpg)`,
          backgroundSize: "cover",
          height: "100vh",
          color: "#ffffff",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexDirection: "column",
          padding: "2rem",
        }}
        onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
        onMouseLeave={() => set({ xys: [0, 0, 1] })}
      >
        <div style={{ marginLeft: "2rem" }}>
          <h1 style={{ fontSize: "4rem", marginBottom: "4rem" }}>
            欢迎来到帮你读
          </h1>
          <h2 style={{ marginBottom: "3rem" }}>Q：什么是帮你读？</h2>
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
          onClick={handleClick}
        >
          立即体验
        </Button>
      </animated.div>
    </>
  );
};

export default WelcomePage;

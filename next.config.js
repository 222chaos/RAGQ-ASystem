/** @type {import('next').NextConfig} */
const nextConfig = {
  // 将纯 esm 模块转为 node 兼容模块
  transpilePackages: [
    "@ant-design/pro-chat",
    "react-intersection-observer",
    "@ant-design/pro-editor",
  ],
};

console.log("success");
console.log("Next.js configuration applied:", nextConfig);

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 将纯 esm 模块转为 node 兼容模块
  transpilePackages: [
    '@ant-design/pro-chat',
    'react-intersection-observer',
    '@ant-design/pro-editor',
    'antd',
    '@ant-design/x',
    '@ant-design/icons',
  ],
};

module.exports = nextConfig;

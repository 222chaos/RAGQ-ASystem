<div align="center">

<img height="120" src="public/logo.png">

<h1>帮你读</h1>

基于 AI 大模型与向量数据库的文档查询工具

English · [简体中文](./README.zh-CN.md) · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

[![][ant-design-shield]][ant-design-link]

</div>
<details>
<summary><kbd>目录</kbd></summary>

#### 目录

- [🔨 使用](#-使用)
- [✨ 特性](#-特性)
- [🖥 浏览器兼容性](#-浏览器兼容性)

####

</details>
<br/>

## 🔨 使用

帮你读是一个RAG应用，使用检索增强生成技术，可以帮助您更轻松地获取相关信息。点击主页上的书籍封面图片，进入ProChat对话组件。在对话框中输入问题或主题，机器人将回答您的问题或提供相关信息。

<br/>

## ✨ 特性

- 使用Next.js作为脚手架。

<br/>访问 https://nextjs.org/docs 查看完整文档。

<br/>

- 通过 text-embedding-ada-002 矢量化文档。

```jsx
await openai.embeddings.create({
  model: 'text-embedding-ada-002',
  input: item,
  encoding_format: 'float',
});
```

- 使用 ProChat 组件🤖

  > \[!NOTE]
  >
  > ProChat 专注于快速搭建起大语言模型 Chat 对话框架。它旨在赋予开发人员轻松打造丰富、动态和直观的聊天界面的能力。

![](https://gw.alipayobjects.com/zos/kitchen/Aa%2452FxhWU/pro-chat.webp)

<br/>

- 使用Qdrant进行数据存储

<br/> <img height="100" src="https://github.com/qdrant/qdrant/raw/master/docs/logo.svg" alt="Qdrant">

<br/>

## 🖥 浏览器兼容性

> \[!NOTE]
>
> - 现代浏览器和 Internet Explorer 11（需要[兼容性填充](https://stackoverflow.com/questions/57020976/polyfills-in-2019-for-ie11)）
> - [Electron](https://www.electronjs.org/)

| [![edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![electron_48x48](https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png)](http://godban.github.io/browsers-support-badges/) |
| --- | --- | --- | --- | --- |
| Edge | 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 |

<br/>

<!-- 链接组 -->

[ant-design-shield]: https://img.shields.io/badge/-Ant%20Design-1677FF?labelColor=black&logo=antdesign&style=flat-square
[ant-design-link]: https://ant.design
[github-issues-link]: https://github.com/microappteam/book-read-ai/issues

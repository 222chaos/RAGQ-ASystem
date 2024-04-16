<div align="center">

<img height="120" src="public/logo.png">

<h1>READING HELPER</h1>

A document query tool based on AI large models and vector databases.

English · [简体中文](./README.zh-CN.md) · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

[![][ant-design-shield]][ant-design-link]

</div>
<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [🔨 Usage](#-usage)
- [✨ Features](#-features)
- [🖥 Browser compatibility](#-browser-compatibility)

####

</details>
<br/>

## 🔨 Usage

Reading Helper is a RAG application that uses search enhancement generation technology to help you get relevant information more easily. Click on the book cover image on the homepage to enter the ProChat conversation component. Enter a question or topic in the dialog box, and the bot will answer your question or provide relevant information.

<br/>

## ✨ Features

- Build with Next.js.

- Vectorize documents by text-embedding-ada-002.

```jsx
await openai.embeddings.create({
  model: 'text-embedding-ada-002',
  input: item,
  encoding_format: 'float',
});
```

- Use Chat Components like Pro!🤖
  > \[!NOTE]
  >
  > ProChat focuses on quickly setting up a large language model chat dialogue framework. It aims to empower developers to easily create rich, dynamic, and intuitive chat interfaces.

[![](https://next.ossinsight.io/widgets/official/compose-activity-trends/thumbnail.png?repo_id=707504998&image_size=auto&color_scheme=dark)](https://next.ossinsight.io/widgets/official/compose-activity-trends?repo_id=707504998)

- Store data with Qdrant <img height="100" src="https://github.com/qdrant/qdrant/raw/master/docs/logo.svg" alt="Qdrant">

<br/>

## 🖥 Browser compatibility

> \[!NOTE]
>
> - Modern browsers and Internet Explorer 11 (with [polyfills](https://stackoverflow.com/questions/57020976/polyfills-in-2019-for-ie11))
> - [Electron](https://www.electronjs.org/)

| [![edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png)](http://godban.github.io/browsers-support-badges/) | [![electron_48x48](https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png)](http://godban.github.io/browsers-support-badges/) |
| --- | --- | --- | --- | --- |
| Edge | last 2 versions | last 2 versions | last 2 versions | last 2 versions |

<br/>

[ant-design-link]: https://ant.design
[github-issues-link]: https://github.com/microappteam/book-read-ai/issues

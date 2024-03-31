import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/logo.png" />
          <meta property="og:title" content="" />
          <meta property="twitter:image" content="/logo.png" />
          <meta property="og:image" content="/logo.png" />
          <meta property="twitter:title" content="帮你读" />
          <meta property="twitter:card" content="summary" />
          <meta
            property="twitter:description"
            content="帮你读是一个基于Rag的阅读助手，能够参考相应的知识从而给出合理回答。"
          />
          <meta property="og:url" content="" />
          <meta
            property="og:description"
            content="帮你读是一个基于Rag的阅读助手，能够参考相应的知识从而给出合理回答。"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

import { StyleProvider, extractStaticStyle } from 'antd-style';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    // Insert StyleProvider for rendering
    const page = await ctx.renderPage({
      enhanceApp: (App) => (props) => (
        <StyleProvider cache={extractStaticStyle.cache}>
          <App {...props} />
        </StyleProvider>
      ),
    });

    // Get static styles of the page one by one
    const styles = extractStaticStyle(page.html).map((item) => item.style);
    console.log('Static styles extracted:', styles);
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {styles}
        </>
      ),
    };
  }
  render() {
    return (
      <Html>
        <Head>
          {this.props.styles}
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
          <meta property="og:url" content="https://book.2chaos.top" />
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

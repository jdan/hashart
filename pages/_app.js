import Head from "next/head";
import "./style.css";

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <meta charSet="UTF-8" />
        <title>hash</title>
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

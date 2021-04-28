import Head from "next/head";
import Link from "next/link";
import pieces from "../art/pieces.js";

export default function Index() {
  return (
    <main>
      <Head>
        <title>index | hash.jordanscales.com</title>
        <meta property="og:title" content="hash.jordanscales.com" />
        <meta
          property="og:description"
          content="Procedural, deterministic art using SHA256 hashes"
        />
        <meta
          property="og:image"
          content="https://hashpng.jordanscales.com/walk/1200/630/fulls.png"
        />
      </Head>

      <div style={{ display: "flex" }}>
        <h1>hash</h1>
      </div>

      <p>
        Art generated from{" "}
        <Link href="https://en.wikipedia.org/wiki/SHA-2">
          <a>SHA-256</a>
        </Link>{" "}
        hashes. by{" "}
        <Link href="https://jordanscales.com">
          <a>jdan</a>
        </Link>
        .
      </p>

      <p>
        Source available{" "}
        <Link href="https://github.com/jdan/hashart">
          <a>on GitHub</a>
        </Link>
        .
      </p>
      <p>Browse the collection:</p>
      <ul>
        {Object.keys(pieces)
          .filter((k) => k !== "mario")
          .map((name) => (
            <li key={name}>
              {new pieces[name]().created ? (
                <>
                  <em>{new pieces[name]().created}</em>
                  {" - "}
                </>
              ) : null}
              <Link href={`/${name}/Hello,%20world!`}>
                <a>{name}</a>
              </Link>
            </li>
          ))}
      </ul>
    </main>
  );
}

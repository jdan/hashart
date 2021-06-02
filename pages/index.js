import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import pieces from "../art/pieces.js";

export default function Index() {
  return (
    <main>
      <Head>
        <title>index | hash.jordanscales.com</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="hash.jordanscales.com" />
        <meta
          property="og:description"
          content="Procedural, deterministic art using SHA256 hashes"
        />
        <meta
          property="og:image"
          content="https://hashpng.jordanscales.com/walk/1200/630/fulls.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@jdan" />
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

      <p>
        This art was created for{" "}
        <Link href="https://github.com/jdan/hashart#rendering-hashart-on-screens">
          <a>small e-ink displays</a>
        </Link>
        , such as my setup below.
      </p>

      <Image
        src="/flat-eric.png"
        alt="A photo of two stuffed animals next to a wooden frame with a digital screen in the middle of it. The screen contains a piece of art consisting of semicircles stacked on top of each other tightly, almost resembling a Slinky, scattered around the canvas"
        width="660"
        height="495"
      />
    </main>
  );
}

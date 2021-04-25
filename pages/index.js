import Link from "next/link";
import pieces from "../art/pieces.js";

export default function Index() {
  return (
    <main>
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
              <Link href={`/${name}/Hello,%20world!`}>
                <a>{name}</a>
              </Link>
            </li>
          ))}
      </ul>
    </main>
  );
}

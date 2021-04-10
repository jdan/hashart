import Link from "next/link";
import art from "../art.js";

export default function Index() {
  return (
    <main>
      <h1>hash</h1>
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
      <p>Browse the collection:</p>
      <ul>
        {Object.keys(art).map((name) => (
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

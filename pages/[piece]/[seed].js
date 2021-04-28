import crypto from "crypto";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import classnames from "classnames";
import debounce from "lodash.debounce";

import pieces from "../../art/pieces.js";
import styles from "./art.module.css";

function Hash({ parts }) {
  return (
    <div className={styles.explanation}>
      {parts.map(({ name, bytes, normalized }) => (
        <div
          key={name}
          className={classnames(styles.segment, {
            [styles.unused]: name === "unused",
          })}
          title={normalized}
        >
          <div>{name}</div>
          <div className={styles.bytes}>{bytes}</div>
        </div>
      ))}
    </div>
  );
}

function Art({ piece, seed, hashString }) {
  const router = useRouter();
  const art = new pieces[piece]();
  const hash = new Uint8Array(Buffer.from(hashString, "hex"));

  const canvasEl = useRef(null);
  useEffect(() => {
    if (!canvasEl || !hash) return;
    let ctx = canvasEl.current.getContext("2d");
    art.render(ctx, hash);
  }, [canvasEl, art, hashString]);

  function handleChange(e) {
    if (/[^\.\s]/.test(e.target.value)) {
      router.replace(`/${piece}/${encodeURIComponent(e.target.value)}`);
    }
  }

  return (
    <main>
      <Head>
        <title>{piece} | hash.jordanscales.com</title>
        <meta
          property="og:title"
          content={`${piece} | hash.jordanscales.com`}
        />
        <meta property="og:description" content={`seed = ${seed}`} />
        <meta
          property="og:image"
          content={`https://hashpng.jordanscales.com/${piece}/1200/630/${seed}.png`}
        />
      </Head>

      <div className={styles.header}>
        <h1>{piece}</h1>
        <div>
          <Link href="/">
            <a>home</a>
          </Link>
          {art.filename ? (
            <>
              {" . "}
              <Link
                href={`https://github.com/jdan/hashart/blob/main/art/${art.filename}`}
              >
                <a>github</a>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.explanation}>
        <div className={styles.segment}>
          <div>
            <label htmlFor="seed">seed</label>
          </div>
          <input
            id="seed"
            className={styles.bytes}
            defaultValue={seed}
            onChange={art.debounce ? debounce(handleChange, 200) : handleChange}
          />
          {art.debounce ? " (debounced for performance)" : null}
        </div>
      </div>

      <div className={styles.explanation}>
        {hash ? <Hash parts={art.explanation(hash)} /> : null}
      </div>

      <canvas
        ref={canvasEl}
        className={styles.canvas}
        width="1320"
        height="1320"
      />

      <aside>
        {art.created ? (
          <p>
            <em>
              <strong>{art.created}</strong>
            </em>
          </p>
        ) : null}

        {hash && art.description(hash) ? (
          <>
            {art
              .description(hash)
              .split(/\n{2,}/)
              .map((para, idx) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: para }} />
              ))}
          </>
        ) : null}
      </aside>
    </main>
  );
}

export default Art;

export async function getServerSideProps(context) {
  const { piece, seed } = context.params;
  const shaSum = crypto.createHash("sha256");
  shaSum.update(seed);
  const buffer = shaSum.digest();

  return {
    props: {
      piece,
      seed,
      hashString: buffer.toString("hex"),
    },
  };
}

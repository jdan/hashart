import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import debounce from "lodash.debounce";

import pieces from "../../art.js";
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

function Art(props) {
  const router = useRouter();
  const { piece, seed } = router.query;
  const art = piece ? new pieces[piece]() : { getDescription: () => "" };

  const [hash, setHash] = useState(null);
  useEffect(async () => {
    if (!seed) return;
    const stringBuffer = new TextEncoder().encode(seed);
    const buffer = await crypto.subtle.digest("SHA-256", stringBuffer);
    setHash(new Uint8Array(buffer));
  }, [seed]);

  const canvasEl = useRef(null);
  useEffect(() => {
    if (!canvasEl || !hash) return;
    let ctx = canvasEl.current.getContext("2d");
    art.render(ctx, hash, props);
  }, [canvasEl, art, hash]);

  function handleChange(e) {
    if (/[^\.\s]/.test(e.target.value)) {
      router.replace(`/${piece}/${encodeURIComponent(e.target.value)}`);
    }
  }

  return (
    <main>
      <Head>
        <title>{piece}</title>
      </Head>

      <div className={styles.header}>
        <h1>{piece}</h1>
        <div>
          <Link href="/">
            <a>home</a>
          </Link>
          {" . "}
          <Link href="https://github.com/jdan/hashart/blob/main/art.js">
            <a>github</a>
          </Link>
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

      {hash && art.description(hash) ? (
        <aside className={styles.description}>
          {art
            .description(hash)
            .split(/\n{2,}/)
            .map((para, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
        </aside>
      ) : null}
    </main>
  );
}

export default Art;

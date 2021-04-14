import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import classnames from "classnames";

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

function Art() {
  const router = useRouter();
  const { piece, seed } = router.query;
  const art = piece ? new pieces[piece]() : {};

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
    art.render(ctx, hash);
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

      <h1>{piece}</h1>

      <div className={styles.explanation}>
        <div className={styles.segment}>
          <div>
            <label htmlFor="seed">seed</label>
          </div>
          <input
            id="seed"
            className={styles.bytes}
            defaultValue={seed}
            onChange={handleChange}
          />
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

      {art.getDescription() ? (
        <aside className={styles.description}>
          {art
            .getDescription()
            .split(/\n{2,}/)
            .map((para, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
        </aside>
      ) : null}

      <p>
        <Link href="/">
          <a>home</a>
        </Link>
      </p>
    </main>
  );
}

export default Art;

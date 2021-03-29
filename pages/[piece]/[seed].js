import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import classnames from "classnames";

import styles from "./art.module.css";
import { Circle } from "../../art.js";

function normalize(buffer) {
  if (buffer.byteLength === 0) {
    return 0;
  } else {
    return buffer[0] / 0x100 + normalize(buffer.slice(1)) / 0x100;
  }
}

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
  const art = new Circle();

  const [hash, setHash] = useState(null);
  useEffect(async () => {
    const stringBuffer = new TextEncoder().encode(seed);
    const buffer = await crypto.subtle.digest("SHA-256", stringBuffer);
    setHash(new Uint8Array(buffer));
  }, [seed]);

  const canvasEl = useRef(null);
  useEffect(() => {
    if (!canvasEl || !hash) return;
    let ctx = canvasEl.current.getContext("2d");
    art.render(ctx, hash);
  }, [canvasEl, piece, hash]);

  return (
    <main>
      <div className={styles.explanation}>
        <div className={styles.segment}>
          seed
          <div className="value-edit-row">
            <div className={styles.bytes}>{seed}</div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        {hash ? <Hash parts={art.explanation(hash)} /> : null}
      </div>

      <canvas
        ref={canvasEl}
        className={styles.canvas}
        width="1600"
        height="1600"
      ></canvas>
    </main>
  );
}

export default Art;

import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import classnames from "classnames";

import { Circle } from "../../art.js";
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
  // Use `piece`
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
  }, [canvasEl, art, hash]);

  function handleChange(e) {
    if (/\w/.test(e.target.value)) {
      router.replace(`/${piece}/${e.target.value}`);
    }
  }

  return (
    <main>
      <div className={styles.explanation}>
        <div className={styles.segment}>
          <div>seed</div>
          <input
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
        width="1600"
        height="1600"
      />
    </main>
  );
}

export default Art;

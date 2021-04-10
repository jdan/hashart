const crypto = require("crypto");
const { createCanvas } = require("canvas");
import pieces from "../../../art.js";

export default async function handler(req, res) {
  const { piece, seed } = req.query;

  const art = new pieces[piece]();
  const canvas = createCanvas(1320, 1320);
  const ctx = canvas.getContext("2d");

  const shaSum = crypto.createHash("sha256");
  shaSum.update(seed);
  const buffer = shaSum.digest();
  const hash = new Uint8Array(buffer);

  art.render(ctx, hash);
  canvas.createPNGStream().pipe(res);
}

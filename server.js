const app = require("express")();
const crypto = require("crypto");
const { createCanvas } = require("canvas");
const pieces = require("./art.js");

app.get("/", (req, res) => res.send("Ayy"));

app.get("/:piece/:seed.png", (req, res) => {
  const { piece, seed } = req.params;

  const art = new pieces[piece]();
  const canvas = createCanvas(600, 600);
  const ctx = canvas.getContext("2d");

  const shaSum = crypto.createHash("sha256");
  shaSum.update(seed);
  const buffer = shaSum.digest();
  const hash = new Uint8Array(buffer);

  art.render(ctx, hash);
  canvas.createPNGStream().pipe(res);
});

app.listen(process.env.VIRTUAL_PORT, "0.0.0.0", () => {
  console.log(`Listening on 0.0.0.0:${process.env.VIRTUAL_PORT}`);
});

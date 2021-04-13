const app = require("express")();
const crypto = require("crypto");
const { createCanvas } = require("canvas");
const pieces = require("./art.js");

app.get("/", (req, res) => {
  res.send(
    `<a href="/stocks/800/600/%40jdan.png">/stocks/800/600/@jdan.png</a>`
  );
});

app.get("/loaderio-027c189a38747b79940b3b6282683540.txt", (req, res) => {
  res.contentType("text/plain");
  res.send("loaderio-027c189a38747b79940b3b6282683540");
});

app.get("/:piece/:width/:height/:seed.png", (req, res) => {
  const { piece, seed, width, height } = req.params;

  const art = new pieces[piece]();
  const canvas = createCanvas(parseInt(width), parseInt(height));
  const ctx = canvas.getContext("2d");

  const shaSum = crypto.createHash("sha256");
  shaSum.update(seed);
  const buffer = shaSum.digest();
  const hash = new Uint8Array(buffer);

  art.render(ctx, hash);
  res.set("Content-Type", "image/png");

  /**
   * `createPNGStream` is handy but unfortunately for my e-ink display
   * I need a proper Content-Length set. So we'll dump the stream into
   * a buffer and send it as a whole.
   */
  var buffs = [];
  const pngStream = canvas.createPNGStream();
  pngStream.on("data", function (d) {
    buffs.push(d);
  });
  pngStream.on("end", function () {
    const buff = Buffer.concat(buffs);
    res.set("Content-Length", buff.byteLength);
    res.send(buff);
  });
});

const port = process.env.VIRTUAL_PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on 0.0.0.0:${port}`);
});

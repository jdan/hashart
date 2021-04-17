const app = require("express")();
const crypto = require("crypto");
const { createCanvas } = require("canvas");
const pieces = require("./art.js");

app.get("/", (req, res) => {
  res.send(`
    Provide a piece, width, height, and seed
    <ul>
      ${Object.keys(pieces)
        .map(
          (name) =>
            `<li><a href="/${name}/800/600/jdan.png">/${name}/800/600/jdan.png</a></li>`
        )
        .join("")}
    </ul>

    Provide a piece and have the server pick a random seed
    <ul>
      <li><a href="/stocks/800/600/random.png">/stocks/800/600/random.png</a></li>
    </ul>

    Have the server pick both the piece and seed
    <ul>
      <li><a href="/random/800/600/random.png">/random/800/600/random.png</a></li>
    </ul>

    Provide a piece and seed with a default resolution of 1320x1320
    <ul>
      <li><a href="/collatz/jdan.png">/collatz/jdan.png</a></li>
    </ul>
  `);
});

function sendArt(res, { piece, width, height, seed }) {
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
}

app.get("/random/:width/:height/random.png", (req, res) => {
  const { width, height } = req.params;

  const pieceKeys = Object.keys(pieces);
  const piece = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
  const seed = Math.random() + "";

  sendArt(res, { piece, seed, width, height });
});

app.get("/:piece/:width/:height/random.png", (req, res) => {
  const { piece, width, height } = req.params;
  const seed = Math.random() + "";

  sendArt(res, { piece, seed, width, height });
});

app.get("/:piece/:width/:height/:seed.png", (req, res) => {
  const { piece, seed, width, height } = req.params;
  sendArt(res, { piece, seed, width, height });
});

app.get("/:piece/:seed.png", (req, res) => {
  const { piece, seed } = req.params;
  sendArt(res, { piece, seed, width: 1320, height: 1320 });
});

const port = process.env.VIRTUAL_PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on 0.0.0.0:${port}`);
});

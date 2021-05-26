const express = require("express");
const crypto = require("crypto");
const { createCanvas } = require("canvas");
const ejs = require("ejs");
const jsnes = require("jsnes");
const pieces = require("./art/pieces.js");
const generateState = require("./scripts/generate-state.js");

const state = generateState();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    Provide a piece, width, height, and seed
    <ul>
      ${Object.keys(pieces)
        .filter((name) => name !== "mario")
        .map(
          (name) =>
            `<li><a href="/${name}/800/600/jdan.png">/${name}/800/600/jdan.png</a></li>`
        )
        .join("")}

        <li><a href="/mario/800/600/jdan.png">/mario/800/600/jdan.png</a> (requires $ROOT/vendor/rom.nes)</li>
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

    Display a 5x5 grid of randomly generated pieces
    <ul>
      <li><a href="/circles/grid">/circles/grid</a></li>
    </ul>

    Adjust the pieces that appear in the random rotation
    <ul>
      <li><a href="/admin">/admin</a> (requires <code>ADMIN_PASSWORD</code> environment variable)</li>
    </ul>
  `);
});

function sendArt(res, { piece, width, height, seed }) {
  const art = new pieces[piece]();
  const canvas = createCanvas(parseInt(width), parseInt(height));
  const ctx = canvas.getContext("2d");

  let props = {};
  if (piece === "mario") {
    if (!state) {
      res.send("State snapshot not found (does $ROOT/vendor/rom.nes exist?)");
      return;
    }

    let latestFrameBuffer = null;
    const nes = new jsnes.NES({
      onFrame: function (frameBuffer) {
        latestFrameBuffer = frameBuffer;
      },
    });

    nes.fromJSON(JSON.parse(state));
    nes.frame();

    props = {
      nes,
      getFrameBuffer() {
        return latestFrameBuffer;
      },
    };
  }

  const shaSum = crypto.createHash("sha256");
  shaSum.update(seed);
  const buffer = shaSum.digest();
  const hash = new Uint8Array(buffer);

  art.render(ctx, hash, props);
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

let enabledPieces = new Set(Object.keys(pieces));

app.get("/admin", (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.statusCode = 404;
    res.send("Not found");
  } else {
    ejs.renderFile(
      "admin.ejs",
      {
        pieces: Object.keys(pieces),
        enabledPieces,
      },
      (err, str) => {
        if (err) {
          res.statusCode = 500;
          res.send("Error");
        } else {
          res.send(str);
        }
      }
    );
  }
});

app.post("/admin", (req, res) => {
  if (
    !process.env.ADMIN_PASSWORD ||
    req.header("Authorization") !== `Bearer ${process.env.ADMIN_PASSWORD}`
  ) {
    res.statusCode = 404;
    res.send("Not found");
  } else {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key]) {
        enabledPieces.add(key);
      } else {
        enabledPieces.delete(key);
      }
    });

    if (enabledPieces.size === 0) {
      res.statusCode = 404;
      res.send("Not found");
      enabledPieces = new Set(Object.keys(pieces));
    } else {
      res.send("Ok");
    }
  }
});

app.get("/random/:width/:height/random.png", (req, res) => {
  const { width, height } = req.params;

  const pieceKeys =
    state == null
      ? Array.from(enabledPieces).filter((name) => name !== "mario")
      : Array.from(enabledPieces);
  const piece = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
  const seed = Math.random() + "";

  sendArt(res, { piece, seed, width, height });
});

app.get("/:piece/grid", (req, res) => {
  const { piece } = req.params;

  let images = "";
  for (let i = 0; i < 25; i++) {
    const seed = Math.random() + "";
    images += `<a href="/${piece}/${seed}.png"><img alt="" src="/${piece}/256/256/${seed}.png"></a>`;
  }

  res.send(`
    <!doctype html>
    <html>
    <head>
      <title>${piece} grid</title>
      <style>
        #grid {
          display: grid;
          grid-template-columns: repeat(5, 256px);
          row-gap: 12px;
          column-gap: 12px;
        }
      </style>
    </head>
    <body>
      <div id="grid">
        ${images}
      </div>
    </body>
    </html>
  `);
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
  console.log(`Listening on http://localhost:${port}`);
});

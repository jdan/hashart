const express = require("express");
const crypto = require("crypto");
const { createCanvas } = require("canvas");
const ejs = require("ejs");
const fs = require("fs");
const glob = require("glob");
const jsnes = require("jsnes");
const path = require("path");
const pieces = require("./art/pieces.js");
const generateState = require("./scripts/generate-state.js");

const state = generateState();
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date()} ${req.ip} ${req.path}`);
  next();
});

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

        <li><a href="/mario/800/600/jdan.png">/mario/800/600/jdan.png</a> (requires $ROOT/vendor/roms/mariobros.nes)</li>
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
      res.send(
        "State snapshot not found (does $ROOT/vendor/roms/mariobros.nes exist?)"
      );
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
  } else if (piece === "nes") {
    let latestFrameBuffer = null;
    const nes = new jsnes.NES({
      onFrame: function (frameBuffer) {
        latestFrameBuffer = frameBuffer;
      },
    });

    const romsGlob = path.join(__dirname, "vendor/roms/**/*.nes");
    const roms = glob.sync(romsGlob);
    if (roms.length === 0) {
      res.send("No roms found (place them in $ROOT/vendor/roms)");
      return;
    }

    const secondCanvas = createCanvas(parseInt(width), parseInt(height));

    props = {
      nes,
      roms,
      fs,
      path,
      getFrameBuffer() {
        return latestFrameBuffer;
      },
      secondCtx: secondCanvas.getContext("2d"),
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

function defaultPieces() {
  return Object.keys(pieces).reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {}
  );
}

function getEnabledPieces() {
  if (!fs.existsSync("db.json")) {
    return defaultPieces();
  } else {
    return JSON.parse(fs.readFileSync("db.json"));
  }
}

function setEnabledPieces(pieces) {
  fs.writeFileSync("db.json", JSON.stringify(pieces, null, 2));
}

app.get("/admin", (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.statusCode = 404;
    res.send("Not found");
  } else {
    ejs.renderFile(
      "admin.ejs",
      {
        pieces: Object.keys(pieces),
        enabledPieces: getEnabledPieces(),
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
    let enabledPieces = getEnabledPieces();

    Object.keys(req.body).forEach((key) => {
      if (req.body[key]) {
        enabledPieces[key] = true;
      } else {
        enabledPieces[key] = false;
      }
    });

    const allFalse = !Object.keys(enabledPieces).some(
      (key) => enabledPieces[key]
    );

    if (allFalse) {
      res.statusCode = 404;
      res.send("Not found");
    } else {
      setEnabledPieces(enabledPieces);
      res.send("Ok");
    }
  }
});

app.get("/random/:width/:height/random.png", (req, res) => {
  const { width, height } = req.params;

  const enabledPieces = getEnabledPieces();
  const pieces = Object.keys(enabledPieces).filter((key) => enabledPieces[key]);

  const pieceKeys =
    state == null ? pieces.filter((name) => name !== "mario") : pieces;
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

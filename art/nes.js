const { Art } = require("./_base.js");

class Nes extends Art {
  // requires SRC_ROOT/vendor/roms/**/*.nes
  constructor() {
    super({
      rom: 12,
    });
    this.hidden = true;
    this.filename = "nes.js";
    this.created = "1 Mar 2022";
  }

  drawBuffer(ctx, frameBuffer) {
    const WIDTH = 256;
    const HEIGHT = 240;
    const verticalPadding = 8;
    const horizontalPadding = 8;

    // https://github.com/bfirsh/jsnes-web/blob/master/src/Screen.js
    const imageData = ctx.getImageData(
      0,
      0,
      WIDTH - 2 * horizontalPadding,
      HEIGHT - 2 * verticalPadding
    );
    const buf = new ArrayBuffer(imageData.data.length);
    const buf32 = new Uint32Array(buf);

    // TODO: 10px border on either side
    for (let y = verticalPadding; y < HEIGHT - verticalPadding; ++y) {
      for (let x = horizontalPadding; x < WIDTH - horizontalPadding; ++x) {
        const nesPx = y * WIDTH + x;
        const bufPx =
          (y - verticalPadding) * (WIDTH - 2 * horizontalPadding) +
          (x - horizontalPadding);
        // Convert pixel from NES BGR to canvas ABGR
        buf32[bufPx] = 0xff000000 | frameBuffer[nesPx]; // Full alpha
      }
    }

    imageData.data.set(new Uint8ClampedArray(buf));
    ctx.putImageData(
      imageData,
      Math.floor(ctx.canvas.width / 2 - (WIDTH - 2 * horizontalPadding) / 2),
      Math.floor(ctx.canvas.height / 2 - (HEIGHT - 2 * verticalPadding) / 2)
    );
  }

  draw(ctx, { rom }, { nes, getFrameBuffer, roms, fs }) {
    const romData = fs.readFileSync(roms[Math.floor(rom * roms.length)], {
      encoding: "binary",
    });

    nes.loadROM(romData);

    // Wait 200 frames
    for (let i = 0; i < 500; i++) {
      nes.frame();
    }

    this.drawBuffer(ctx, getFrameBuffer());
  }
}

exports.Nes = Nes;

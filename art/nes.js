const { Art } = require("./_base.js");
const { _ } = require("./util.js");

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

  drawBuffer(ctx, secondCtx, frameBuffer) {
    const WIDTH = 256;
    const HEIGHT = 240;
    const verticalPadding = 8;
    const horizontalPadding = 8;

    const w = WIDTH - 2 * horizontalPadding;
    const h = HEIGHT - 2 * verticalPadding;

    // https://github.com/bfirsh/jsnes-web/blob/master/src/Screen.js
    const imageData = secondCtx.getImageData(0, 0, w, h);

    const buf = new ArrayBuffer(imageData.data.length);
    const buf32 = new Uint32Array(buf);

    // TODO: 10px border on either side
    for (let y = verticalPadding; y < HEIGHT - verticalPadding; ++y) {
      for (let x = horizontalPadding; x < WIDTH - horizontalPadding; ++x) {
        const nesPx = y * WIDTH + x;
        const bufPx = (y - verticalPadding) * w + (x - horizontalPadding);
        // Convert pixel from NES BGR to canvas ABGR
        buf32[bufPx] = 0xff000000 | frameBuffer[nesPx]; // Full alpha
      }
    }

    imageData.data.set(new Uint8ClampedArray(buf));
    secondCtx.putImageData(imageData, 0, 0);

    const scale = Math.min(
      Math.floor(ctx.canvas.width / w),
      Math.floor(ctx.canvas.height / h)
    );

    ctx.scale(scale);

    ctx.drawImage(
      secondCtx.canvas,
      0,
      0,
      w,
      h,
      Math.floor(ctx.canvas.width / 2 - (w * scale) / 2),
      Math.floor(ctx.canvas.height / 2 - (h * scale) / 2),
      w * scale,
      h * scale
    );
  }

  draw(ctx, { rom }, { nes, getFrameBuffer, roms, fs, path, secondCtx }) {
    const romPath = roms[Math.floor(rom * roms.length)];
    const romData = fs.readFileSync(romPath, {
      encoding: "binary",
    });

    nes.loadROM(romData);

    // Wait 200 frames
    for (let i = 0; i < 500; i++) {
      nes.frame();
    }

    this.drawBuffer(ctx, secondCtx, getFrameBuffer());
    ctx.font = `bold ${_(30, ctx.canvas.width)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(
      path.parse(romPath).name,
      ctx.canvas.width / 2,
      ctx.canvas.height - 40
    );
  }
}

exports.Nes = Nes;

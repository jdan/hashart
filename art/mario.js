const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Mario extends Art {
  // requires SRC_ROOT/vendor/roms/mariobros.nes
  constructor() {
    super({
      inputs: 32,
    });
    this.hidden = true;
    this.filename = "mario.js";
    this.created = "18 Apr 2021";
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
    ctx.putImageData(imageData, 0, 0);

    // turn off antialiasing
    ctx.imageSmoothingEnabled = false;
    const scale = Math.min(
      ctx.canvas.width / (WIDTH - 2 * horizontalPadding),
      ctx.canvas.height / (HEIGHT - 2 * verticalPadding)
    );

    ctx.scale(scale, scale);
    // TODO - center and draw some black/white bars
    ctx.drawImage(ctx.canvas, 0, 0);
  }

  buttonPress(nes, button, holdFrames = 1) {
    nes.buttonDown(1, button);
    for (let i = 0; i < holdFrames; i++) {
      nes.frame();
    }
    nes.buttonUp(1, button);
    nes.frame();
  }

  draw(ctx, { inputsBuffer }, { nes, getFrameBuffer }) {
    const BUTTON_A = 0;
    const BUTTON_B = 1;
    const BUTTON_UP = 4;
    const BUTTON_DOWN = 5;
    const BUTTON_LEFT = 6;
    const BUTTON_RIGHT = 7;

    inputsBuffer.forEach((v) => {
      const options = [
        //BUTTON_LEFT,
        BUTTON_UP,
        BUTTON_RIGHT,
        BUTTON_RIGHT,
        BUTTON_RIGHT,
        BUTTON_RIGHT,
        BUTTON_LEFT,
        BUTTON_A,
        BUTTON_A,
        BUTTON_B,
      ];

      const button = options[Math.floor((v / 256) * options.length)];
      // hold for 10 frames
      this.buttonPress(nes, button, 10);
    });

    this.drawBuffer(ctx, getFrameBuffer());
  }
}

exports.Mario = Mario;

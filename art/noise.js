const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Noise extends Art {
  constructor() {
    super({
      test: 32,
    });
    this.filename = "noise.js";
    this.created = "09 Jun 2021";
  }

  getDescription() {
    return `
      Divide the canvas into squares and color square <code>(x, y)</code>
      a shade of gray (0-255) using the formula:

      Math.abs(Math.sin(test * x * y)) * 256
    `;
  }

  getSize(ctx) {
    return _(12, ctx.canvas.width);
  }

  draw(ctx, { test }) {
    const s = this.getSize(ctx);

    for (let x = 0; x < ctx.canvas.width; x += s) {
      for (let y = 0; y < ctx.canvas.height; y += s) {
        const g = Math.floor(
          Math.abs(Math.sin(test * (x / s + 1) * (y / s + 1))) * 256
        );
        ctx.fillStyle = `rgb(${g}, ${g}, ${g})`;
        ctx.fillRect(x, y, s, s);
      }
    }
  }
}

exports.Noise = Noise;

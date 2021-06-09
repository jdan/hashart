const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Noise extends Art {
  constructor() {
    super({
      test: 32,
    });
    this.filename = "noise.js";
    this.created = "09 Jun 2021";

    this.s = 12;
  }

  getDescription() {
    return `
      Divide the canvas into ${this.s}px by ${this.s}px squares and color square
      <code>(x, y)</code> a shade of gray (0-255) using the formula:

      Math.abs(Math.sin(test * x * y)) * 256
    `;
  }

  draw(ctx, { test }) {
    for (let x = 0; x < ctx.canvas.width; x += this.s) {
      for (let y = 0; y < ctx.canvas.height; y += this.s) {
        const g = Math.floor(
          Math.abs(Math.sin(test * (x / this.s + 1) * (y / this.s + 1))) * 256
        );
        ctx.fillStyle = `rgb(${g}, ${g}, ${g})`;
        ctx.fillRect(x, y, this.s, this.s);
      }
    }
  }
}

exports.Noise = Noise;

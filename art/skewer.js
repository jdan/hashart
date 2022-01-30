const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class Skewer extends Art {
  constructor() {
    super({
      changes: 32,
    });

    this.filename = "skewer.js";
    this.created = "30 Jan 2022";
  }

  getDescription() {
    return `
			Start with a circle of a given radius. As we travel down the line
			towards the front, modify the radius by reading the next byte from
			<code>changes</code>, where a byte above 128 increases the radius, and
			a byte below 128 decreases it.
    `;
  }

  draw(ctx, { changesBuffer }) {
    ctx.lineWidth = 3;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const scale = 20;
    let currentRadius = 40;
    changesBuffer.forEach((byte, idx) => {
      const x = project(idx, 31, 0, 0.2 * w, 0.8 * w);
      const y = project(idx, 31, 0, 0.6 * h, 0.4 * h);
      ctx.beginPath();
      ctx.arc(x, y, Math.abs(currentRadius), 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();

      const delta = (scale * (byte - 128)) / 128;
      currentRadius += delta;
    });
  }
}

exports.Skewer = Skewer;

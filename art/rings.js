const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class Rings extends Art {
  constructor() {
    super({
      init: 2,
      thickness: 5,
      changes: 20,
    });

    this.filename = "rings.js";
    this.created = "30 Jan 2022";
  }

  getDescription() {
    return `
			Start with a ring of radius <code>init</code> and width of
      <code>thickness</code>. For each subsequent byte in <code>changes</code>,
      adjust the radius where a byte less than 128 decreases it, and a byte
      above 128 increases it.
    `;
  }

  draw(ctx, { init, thickness, changesBuffer }) {
    ctx.lineWidth = 3;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const e = _(thickness * 40 + 10, w);

    const scale = _(30, w);
    let currentRadius = _(init * 40, w);
    changesBuffer.forEach((byte, idx) => {
      const x = project(idx, changesBuffer.length - 1, 0, 0.2 * w, 0.8 * w);
      const y = project(idx, changesBuffer.length - 1, 0, 0.6 * h, 0.4 * h);

      const delta = (scale * (byte - 128)) / 128;

      const r = Math.abs(currentRadius);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.arc(x, y, r + e, 0, 2 * Math.PI, true);
      ctx.stroke();
      ctx.fill();

      currentRadius += delta;
    });
  }
}

exports.Rings = Rings;

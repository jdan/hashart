const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Divisions extends Art {
  constructor() {
    super({
      divisions: 16,
    });
    this.created = "01 Jun 2021";
    this.filename = "divisions.js";
  }

  getDescription({ divisionsBuffer }) {
    return `
      For each of the ${divisionsBuffer.length} bytes in <code>divisions</code>,
      we cut the canvas into two pieces. The distance from the edge that we do this
      is determined by the square of the current byte. We then rotate and repeat this
      process on the remaining canvas.

      If each of these distances were 1/φ (the golden ratio), we would end up with the
      <a href="https://en.wikipedia.org/wiki/Golden_spiral">Golden spiral</a>.
    `;
  }

  draw(ctx, { divisionsBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.lineWidth = _(3, w);

    let minX = 0;
    let minY = 0;
    let maxX = w;
    let maxY = h;

    divisionsBuffer.forEach((value, idx) => {
      const cutPct = Math.pow(value / 256, 2);

      ctx.beginPath();
      if (idx % 4 === 0) {
        minX += (maxX - minX) * cutPct;
        ctx.moveTo(minX, minY);
        ctx.lineTo(minX, maxY);
      } else if (idx % 4 === 1) {
        minY += (maxY - minY) * cutPct;
        ctx.moveTo(minX, minY);
        ctx.lineTo(maxX, minY);
      } else if (idx % 4 === 2) {
        maxX -= (maxX - minX) * cutPct;
        ctx.moveTo(maxX, minY);
        ctx.lineTo(maxX, maxY);
      } else if (idx % 4 === 3) {
        maxY -= (maxY - minY) * cutPct;
        ctx.moveTo(minX, maxY);
        ctx.lineTo(maxX, maxY);
      }

      ctx.stroke();
    });
  }
}

exports.Divisions = Divisions;

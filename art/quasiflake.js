const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class QuasiFlake extends Art {
  constructor() {
    super({
      fractures: 32,
    });
    this.hidden = true;
    this.filename = "quasiflake.js";
    this.created = "05 Jun 2021";
  }

  getDescription({ fracturesBuffer }) {
    return `
      Begin with three line segments forming an equilateral triangle. For each
      of the ${fracturesBuffer.length} bytes in <code>fractures</code>, grab
      the <code>(byte % segments.length)</code>th segment and split it into three sections
      of equal length. Remove the middle segment, replacing it with two segments of
      the same length arranged to form a mountain.

      If we repeated this process indefinitely on every segment (and not just those
      selected with <code>fractures</code>), we would form a
      <a href="https://en.wikipedia.org/wiki/Koch_snowflake">Koch snowflake</a>.
    `;
  }

  draw(ctx, { fracturesBuffer }) {
    let lines = [
      { theta: -Math.PI / 3, r: 1 },
      { theta: Math.PI, r: 1 },
      { theta: Math.PI / 3, r: 1 },
    ];
    fracturesBuffer.forEach((byte) => {
      const idx = byte % lines.length;
      const line = lines[idx];

      // ___ -> _/\_
      lines.splice(
        idx,
        1,
        {
          theta: line.theta,
          r: line.r / 3,
        },
        {
          theta: line.theta + Math.PI / 3,
          r: line.r / 3,
        },
        {
          theta: line.theta - Math.PI / 3,
          r: line.r / 3,
        },
        {
          theta: line.theta,
          r: line.r / 3,
        }
      );
    });

    let w = ctx.canvas.width;
    let h = ctx.canvas.height;

    // Center as large a square as possible on the canvas
    ctx.lineWidth = _(5, w);
    let scale = 0.75 * Math.min(w, h);

    let x = w / 2;
    let y = h / 2 - (scale * Math.sqrt(3)) / 3;

    ctx.beginPath();
    ctx.moveTo(x, y);

    lines.forEach(({ theta, r }) => {
      x += r * scale * Math.cos(theta);
      y -= r * scale * Math.sin(theta);
      ctx.lineTo(x, y);
    });

    ctx.stroke();
  }
}

exports.QuasiFlake = QuasiFlake;

const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class HoneyComb extends Art {
  constructor() {
    super({
      patterns: 22,
    });

    this.filename = "honeycomb.js";
    this.created = "13 Feb 2022";
  }

  getDescription() {
    return `
			TBA
    `;
  }

  drawHexagon(ctx, pattern, x, y, sideLength) {
    // Edge
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const theta = Math.PI / 6 + (i * 2 * Math.PI) / 6;
      const [px, py] = [
        x + sideLength * Math.cos(theta),
        y + sideLength * Math.sin(theta),
      ];

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Connectors
    const [a, b] = [Math.floor(pattern / 6), pattern % 6];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + ((sideLength * Math.sqrt(3)) / 2) * Math.cos((a * 2 * Math.PI) / 6),
      y + ((sideLength * Math.sqrt(3)) / 2) * Math.sin((a * 2 * Math.PI) / 6)
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + ((sideLength * Math.sqrt(3)) / 2) * Math.cos((b * 2 * Math.PI) / 6),
      y + ((sideLength * Math.sqrt(3)) / 2) * Math.sin((b * 2 * Math.PI) / 6)
    );
    ctx.stroke();
  }

  draw(ctx, { patternsBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const s = Math.max(w, h);
    ctx.lineWidth = _(3, s);

    const sideLength = _(80, s);

    // https://stackoverflow.com/questions/2459402/hexagonal-grid-coordinates-to-pixel-coordinates
    [
      [-2, 2],
      [-1, 2],
      [0, 2],
      [-2, 1],
      [-1, 1],
      [0, 1],
      [1, 1],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
      [0, -2],
      [1, -2],
      [2, -2],
    ].forEach(([a, b], idx) => {
      const x = w / 2 - Math.sqrt(3) * sideLength * (b / 2 + a);
      const y = h / 2 - (3 / 2) * sideLength * b;
      this.drawHexagon(ctx, patternsBuffer[idx], x, y, sideLength);
    });
  }
}

exports.HoneyComb = HoneyComb;

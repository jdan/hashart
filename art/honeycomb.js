const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class HoneyComb extends Art {
  constructor() {
    super({
      paths: 19,
    });

    this.filename = "honeycomb.js";
    this.created = "13 Feb 2022";
  }

  getDescription({ pathsBuffer }) {
    return `
			Arrange ${pathsBuffer.length} hexagons into one larger hexagon. For
      each of the ${pathsBuffer.length} bytes in the buffer: If the byte is
      greater than <code>216</code>, do nothing. Otherwise, use the byte value
      to generate two numbers <code>a, b</code> between 0 and 5.

      Draw a path connecting side <code>a</code> to side <code>b</code>, or a
      dead end if they are equal.
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

    const [a, b] = [Math.floor(pattern / 36), pattern % 6];

    const gap = sideLength / 4;
    const l = (sideLength * Math.sqrt(3)) / 2;

    const aTheta = (a * 2 * Math.PI) / 6;
    const bTheta = (b * 2 * Math.PI) / 6;

    if (a === b) {
      ctx.beginPath();
      ctx.moveTo(
        x + l * Math.cos(aTheta) - (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + l * Math.sin(aTheta) - (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );
      ctx.lineTo(
        x + gap * Math.cos(aTheta) - (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + gap * Math.sin(aTheta) - (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );

      ctx.lineTo(
        x + gap * Math.cos(aTheta) + (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + gap * Math.sin(aTheta) + (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );
      ctx.lineTo(
        x + l * Math.cos(aTheta) + (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + l * Math.sin(aTheta) + (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );

      ctx.stroke();
    } else {
      // A
      ctx.beginPath();
      ctx.moveTo(
        x + l * Math.cos(aTheta) - (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + l * Math.sin(aTheta) - (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );
      ctx.lineTo(
        x + gap * Math.cos(aTheta) - (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + gap * Math.sin(aTheta) - (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );

      // todo - arc?

      ctx.lineTo(
        x + gap * Math.cos(bTheta) + (gap / 2) * Math.cos(bTheta - Math.PI / 2),
        y + gap * Math.sin(bTheta) + (gap / 2) * Math.sin(bTheta - Math.PI / 2)
      );
      ctx.lineTo(
        x + l * Math.cos(bTheta) + (gap / 2) * Math.cos(bTheta - Math.PI / 2),
        y + l * Math.sin(bTheta) + (gap / 2) * Math.sin(bTheta - Math.PI / 2)
      );
      ctx.stroke();

      // B

      ctx.beginPath();
      ctx.moveTo(
        x + l * Math.cos(aTheta) + (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + l * Math.sin(aTheta) + (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );
      ctx.lineTo(
        x + gap * Math.cos(aTheta) + (gap / 2) * Math.cos(aTheta - Math.PI / 2),
        y + gap * Math.sin(aTheta) + (gap / 2) * Math.sin(aTheta - Math.PI / 2)
      );

      // todo - arc?

      ctx.lineTo(
        x + gap * Math.cos(bTheta) - (gap / 2) * Math.cos(bTheta - Math.PI / 2),
        y + gap * Math.sin(bTheta) - (gap / 2) * Math.sin(bTheta - Math.PI / 2)
      );
      ctx.lineTo(
        x + l * Math.cos(bTheta) - (gap / 2) * Math.cos(bTheta - Math.PI / 2),
        y + l * Math.sin(bTheta) - (gap / 2) * Math.sin(bTheta - Math.PI / 2)
      );
      ctx.stroke();
    }
  }

  draw(ctx, { pathsBuffer }) {
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
      if (pathsBuffer[idx] < 216) {
        this.drawHexagon(ctx, pathsBuffer[idx], x, y, sideLength);
      }
    });
  }
}

exports.HoneyComb = HoneyComb;

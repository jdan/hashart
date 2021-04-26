const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Walk extends Art {
  constructor() {
    super({
      turns: 32,
    });
    this.filename = "walk.js";
    this.created = "26 Apr 2021";
  }

  getDescription() {
    return `
      We illustrate a <a href="https://en.wikipedia.org/wiki/Random_walk">random walk</a>, starting at
      (0, 0) with a direction of "east."

      For each byte in the <code>moves</code> buffer, we walk forward, then turn "left" if
      the byte is odd or "right" if it is even.
    `;
  }

  draw(ctx, { turnsBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const s = Math.min(w, h);
    const WALK_LENGTH = _(10, s);
    let dir = { dx: 1, dy: 0 };
    let pos = { x: 0, y: 0 };
    const path = [pos];

    Array.from(turnsBuffer).forEach((byte) => {
      // TODO: get 8 turns from each one?
      pos = {
        x: pos.x + WALK_LENGTH * dir.dx,
        y: pos.y + WALK_LENGTH * dir.dy,
      };
      path.push(pos);

      if (dir.dx === 1) {
        dir = {
          dx: 0,
          dy: byte % 2 === 0 ? -1 : 1,
        };
      } else if (dir.dy === 1) {
        dir = {
          dx: byte % 2 === 0 ? 1 : -1,
          dy: 0,
        };
      } else if (dir.dx === -1) {
        dir = {
          dx: 0,
          dy: byte % 2 === 0 ? 1 : -1,
        };
      } else {
        dir = {
          dx: byte % 2 === 0 ? -1 : 1,
          dy: 0,
        };
      }
    });

    const minX = Math.min(...path.map(({ x }) => x));
    const maxX = Math.max(...path.map(({ x }) => x));
    const minY = Math.min(...path.map(({ y }) => y));
    const maxY = Math.max(...path.map(({ y }) => y));
    const maxSideLength = Math.max(maxX - minX, maxY - minY);

    const PADDING = _(120, s);

    ctx.lineWidth = 6;
    ctx.beginPath();
    path.forEach(({ x, y }, idx) => {
      const x_ =
        ((x - minX) / maxSideLength) * (s - PADDING - PADDING) + PADDING;
      const y_ =
        ((y - minY) / maxSideLength) * (s - PADDING - PADDING) + PADDING;

      if (idx === 0) {
        ctx.moveTo(x_, y_);
      } else {
        ctx.lineTo(x_, y_);
      }
    });
    ctx.stroke();
  }
}

exports.Walk = Walk;

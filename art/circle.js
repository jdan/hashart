const { Art } = require("./_base.js");

class Circle extends Art {
  constructor() {
    super({
      x1: 2,
      r1: 2,
      x2: 2,
      r2: 2,
      x3: 2,
      r3: 2,
      x4: 2,
      r4: 2,
    });
    this.filename = "circle.js";
  }

  getDescription() {
    return `
      From the template we gather ${
        Object.keys(this.template).length / 2
      } circles and their radii and place
      them on the horizon. Intersections of these circles (if any) are labeled by drawing a chord between the two
      intersection points.
    `;
  }

  drawCircle(ctx, x, r) {
    const h = ctx.canvas.height;
    ctx.beginPath();
    ctx.arc(x, h / 2, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  drawIntersection(ctx, x1, r1, x2, r2) {
    const h = ctx.canvas.height;
    const d = x2 - x1;

    // https://mathworld.wolfram.com/Circle-CircleIntersection.html
    const intersectionOffset = (d * d - r2 * r2 + r1 * r1) / (2 * d);
    const y = Math.sqrt(
      (4 * d * d * r1 * r1 - Math.pow(d * d - r2 * r2 + r1 * r1, 2)) /
        (4 * d * d)
    );

    ctx.beginPath();
    ctx.moveTo(x1 + intersectionOffset, h / 2 - y);
    ctx.lineTo(x1 + intersectionOffset, h / 2 + y);
    ctx.stroke();
  }

  draw(ctx, { x1, r1, x2, r2, x3, r3, x4, r4 }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const xs = [x1, x2, x3, x4].map((x) => Math.round(x * w));
    const rs = [r1, r2, r3, r4].map((r) => r * 0.6 * w);

    xs.forEach((x, i) => {
      this.drawCircle(ctx, x, rs[i]);
    });

    // Pair up each circle to draw an intersection chord (if any)
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ].forEach(([a, b]) => {
      this.drawIntersection(ctx, xs[a], rs[a], xs[b], rs[b]);
    });
  }
}

exports.Circle = Circle;

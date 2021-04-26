const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Boxes extends Art {
  constructor() {
    super({
      w1: 2,
      d1: 2,
      h1: 2,

      w2: 2,
      d2: 2,
      h2: 2,

      w3: 2,
      d3: 2,
      h3: 2,
    });

    this.filename = "boxes.js";
    this.created = "29 Mar 2021";
  }

  getDescription() {
    return `
      From the template we gather dimensions for ${
        Object.keys(this.template).length / 3
      } boxes and place them
      next to each other on the ground. The boxes are rendered isometrically with a front-facing light source.
    `;
  }

  coordToIso(x, y, z) {
    return [x + 0.4 * z, y - 0.2 * z];
  }

  drawBox(ctx, { x, y, d, w, h }) {
    const cols = {
      front: "rgb(240, 240, 240)",
      top: "rgb(180, 180, 180)",
      side: "rgb(120, 120, 120)",
    };

    // front
    ctx.fillStyle = cols.front;
    ctx.beginPath();
    ctx.moveTo(...this.coordToIso(x, y, -d));
    ctx.lineTo(...this.coordToIso(x, y - h, -d));
    ctx.lineTo(...this.coordToIso(x + w, y - h, -d));
    ctx.lineTo(...this.coordToIso(x + w, y, -d));
    ctx.lineTo(...this.coordToIso(x, y, -d));
    ctx.fill();
    ctx.stroke();

    // top
    ctx.fillStyle = cols.top;
    ctx.beginPath();
    ctx.moveTo(...this.coordToIso(x, y - h, -d));
    ctx.lineTo(...this.coordToIso(x, y - h, 0));
    ctx.lineTo(...this.coordToIso(x + w, y - h, 0));
    ctx.lineTo(...this.coordToIso(x + w, y - h, -d));
    ctx.lineTo(...this.coordToIso(x, y - h, -d));
    ctx.fill();
    ctx.stroke();

    // side
    ctx.fillStyle = cols.side;
    ctx.beginPath();
    ctx.moveTo(...this.coordToIso(x + w, y, -d));
    ctx.lineTo(...this.coordToIso(x + w, y - h, -d));
    ctx.lineTo(...this.coordToIso(x + w, y - h, 0));
    ctx.lineTo(...this.coordToIso(x + w, y, 0));
    ctx.lineTo(...this.coordToIso(x + w, y, -d));
    ctx.fill();
    ctx.stroke();
  }

  draw(ctx, { w1, d1, h1, w2, d2, h2, w3, d3, h3 }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const x = 0.25 * w;
    const y = 0.7 * h;

    const wMin = _(20, w);
    const dScale = _(400, w);
    const wScale = _(300, w);
    const hScale = _(600, w);

    this.drawBox(ctx, {
      x,
      y,
      d: d1 * dScale,
      w: w1 * wScale + wMin,
      h: h1 * hScale,
    });

    this.drawBox(ctx, {
      x: x + w1 * wScale + wMin,
      y,
      d: d2 * dScale,
      w: w2 * wScale + wMin,
      h: h2 * hScale,
    });

    this.drawBox(ctx, {
      x: x + w1 * wScale + wMin + w2 * wScale + wMin,
      y,
      d: d3 * dScale,
      w: w3 * wScale + wMin,
      h: h3 * hScale,
    });
  }
}

exports.Boxes = Boxes;

const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Boxes extends Art {
  constructor() {
    super({
      box1: 6,
      box2: 6,
      box3: 6,
      box4: 6,
    });

    this.filename = "boxes.js";
    this.created = "29 Mar 2021";
  }

  getDescription() {
    return `
      From the template we gather dimensions for ${
        Object.keys(this.template).length
      } boxes and place them
      next to each other on the ground.

      Each box is represented as six bytes, which is divided into three sections
      for width, depth, and height respectively.

      The boxes are rendered isometrically with a front-facing light source.
    `;
  }

  coordToIso(x, y, z) {
    return [x + 0.4 * z, y - 0.2 * z];
  }

  drawBox(ctx, { x, y, w, d, h }) {
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

  draw(ctx, { box1Buffer, box2Buffer, box3Buffer, box4Buffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const x = 0.25 * w;
    const y = 0.7 * h;

    const wMin = _(20, w);
    const dScale = _(400, w);
    const wScale = _(300, w);
    const hScale = _(600, w);

    const w1 = (256 * box1Buffer[0] + box1Buffer[1]) / 65536;
    const d1 = (256 * box1Buffer[2] + box1Buffer[3]) / 65536;
    const h1 = (256 * box1Buffer[4] + box1Buffer[5]) / 65536;

    const w2 = (256 * box2Buffer[0] + box2Buffer[1]) / 65536;
    const d2 = (256 * box2Buffer[2] + box2Buffer[3]) / 65536;
    const h2 = (256 * box2Buffer[4] + box2Buffer[5]) / 65536;

    const w3 = (256 * box3Buffer[0] + box3Buffer[1]) / 65536;
    const d3 = (256 * box3Buffer[2] + box3Buffer[3]) / 65536;
    const h3 = (256 * box3Buffer[4] + box3Buffer[5]) / 65536;

    const w4 = (256 * box4Buffer[0] + box4Buffer[1]) / 65536;
    const d4 = (256 * box4Buffer[2] + box4Buffer[3]) / 65536;
    const h4 = (256 * box4Buffer[4] + box4Buffer[5]) / 65536;

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

    this.drawBox(ctx, {
      x: x + w1 * wScale + wMin + w2 * wScale + wMin + w3 * wScale + wMin,
      y,
      d: d4 * dScale,
      w: w4 * wScale + wMin,
      h: h4 * hScale,
    });
  }
}

exports.Boxes = Boxes;

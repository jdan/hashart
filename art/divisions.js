const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Divisions extends Art {
  constructor() {
    super({
      divisions: 32,
    });
    this.created = "05 Jun 2021";
    this.filename = "divisions.js";
  }

  getDescription({ divisionsBuffer }) {
    return `
      Begin with a single rectangle covering the entire canvas.

      For each of the ${divisionsBuffer.length} bytes in <code>divisions</code>,
      determine which rectangle to split (<code>byte % rectangles.length</code>) and
      divide that rectangle in half either horizontally or vertically (<code>byte % 2</code>).
    `;
  }

  draw(ctx, { divisionsBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.lineWidth = _(5, w);

    let regions = [{ x: 0, y: 0, w, h }];

    for (let i = 0; i < divisionsBuffer.length; i += 1) {
      const idx = divisionsBuffer[i] % regions.length;
      const direction = divisionsBuffer[i] % 2;
      const region = regions[idx];

      if (direction === 0) {
        regions.splice(
          idx,
          1,
          { x: region.x, y: region.y, w: region.w, h: region.h / 2 },
          {
            x: region.x,
            y: region.y + region.h / 2,
            w: region.w,
            h: region.h / 2,
          }
        );
      } else {
        regions.splice(
          idx,
          1,
          { x: region.x, y: region.y, w: region.w / 2, h: region.h },
          {
            x: region.x + region.w / 2,
            y: region.y,
            w: region.w / 2,
            h: region.h,
          }
        );
      }
    }

    regions.forEach(({ x, y, w, h }) => {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.stroke();
    });
  }
}

exports.Divisions = Divisions;

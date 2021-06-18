const { Art } = require("./_base.js");
const { _, bigIntOfBuffer } = require("./util.js");

class Sandpiles extends Art {
  constructor() {
    super({
      pile1: 3,
      pile2: 3,
      pile3: 3,
      pile4: 3,
      pile5: 3,
      pile6: 3,
      pile7: 3,
      pile8: 3,
    });
    this.filename = "sandpiles.js";
    this.created = "17 Jun 2021";
  }

  getDescription() {
    return `
      For each of the ${Object.keys(this.template).length} piles, read ${
      this.template.pile1
    } bytes as a triple <code>(x, y, amount)</code>. At position (x, y), place
    <code>amount</code> grains. Then, for all cells in the grid, if there are
    <strong>4 or more</strong> grains, spill one grain in each of the four cardinal directions. Repeat
    this process until no grains fall.

    This is a cellular automaton known as the <a href="https://en.wikipedia.org/wiki/Abelian_sandpile_model">Abelian
    sanpile model</a> and it produces surprisingly interesting and complex patterns. When two piles interact, the result is
    mostly a jumbled mess.
  `;
  }

  getSize(ctx) {
    return _(30, ctx.canvas.width);
  }

  draw(ctx, props) {
    const s = this.getSize(ctx);
    const w = Math.ceil(ctx.canvas.width / s);
    const h = Math.ceil(ctx.canvas.height / s);

    let grid = [];

    for (let i = 0; i < Object.keys(this.template).length; i++) {
      const buf = props[`pile${i + 1}Buffer`];

      let x = Math.floor((buf[0] / 256) * w);
      let y = Math.floor((buf[1] / 256) * h);

      grid[[x, y]] = buf[2];
    }

    // avalanche
    let shouldPropagate = true;
    while (shouldPropagate) {
      shouldPropagate = false;

      Object.keys(grid).forEach((pos) => {
        const [x, y] = pos.split(",").map((i) => parseInt(i));
        if (x < 0 || y < 0 || x > w || y > h) {
          return;
        }

        if (grid[[x, y]] >= 4) {
          let spillover = Math.floor(grid[[x, y]] / 4);
          grid[[x + 1, y]] = (grid[[x + 1, y]] || 0) + spillover;
          grid[[x, y + 1]] = (grid[[x, y + 1]] || 0) + spillover;
          grid[[x - 1, y]] = (grid[[x - 1, y]] || 0) + spillover;
          grid[[x, y - 1]] = (grid[[x, y - 1]] || 0) + spillover;
          grid[[x, y]] = grid[[x, y]] % 4;
          shouldPropagate = true;
        }
      });
    }

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let value = +grid[[x, y]];
        if (!value) continue;

        if (value > 3) {
          value = 3;
        }
        let g = [255, 160, 90, 40][value];
        ctx.fillStyle = `rgb(${g}, ${g}, ${g})`;
        ctx.fillRect(x * s, y * s, s, s);
      }
    }
  }
}

exports.Sandpiles = Sandpiles;

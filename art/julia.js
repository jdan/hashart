const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class Julia extends Art {
  constructor() {
    super({
      real: 16,
      imaginary: 16,
    });
    // not very interesting
    this.hidden = true;
    this.filename = "julia.js";
    this.created = "10 Oct 2023";
  }

  getDescription({ real, imaginary }) {
    return `
      z = z^2 + ${this.getReal(real)} + ${this.getImaginary(imaginary)}i
    `;
  }

  getReal(real) {
    return project(real, 0, 1, -1, 1);
  }

  getImaginary(imaginary) {
    return project(imaginary, 0, 1, -1, 1);
  }

  draw(ctx, { real, imaginary }) {
    const cr = this.getReal(real);
    const ci = this.getImaginary(imaginary);

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const s = _(8, w);
    const ITERATIONS = 20;

    const aspectRatio = w / h;

    for (let x = 0; x < w; x += s) {
      for (let y = 0; y < h; y += s) {
        const im = project(y, 0, h, -1, 1);
        const re = project(x, 0, w, -1 * aspectRatio, 1 * aspectRatio);

        // TODO: after this works, a "flow" would be more interesting
        let zr = re;
        let zi = im;
        for (let i = 0; i < ITERATIONS; i++) {
          // z = z^2 + c
          const zr2 = zr * zr - zi * zi;
          const zi2 = 2 * zr * zi;

          zr = zr2 + cr;
          zi = zi2 + ci;
        }

        let shade = project(zr * zr + zi * zi, 0, 4, 0, 255);
        if (Number.isNaN(shade)) {
          shade = 255;
        }

        if (shade < 0) {
          shade = 0;
        }
        if (shade > 255) {
          shade = 255;
        }

        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.fillRect(x, y, s, s);
      }
    }

    const s2 = _(32, w);
    for (let x = 0; x < w; x += s2) {
      for (let y = 0; y < h; y += s2) {
        const re = project(x, 0, w, -1 * aspectRatio, 1 * aspectRatio);
        const im = project(y, 0, h, -1, 1);

        // Get the next coordinate
        const zr2 = re * re - im * im;
        const zi2 = 2 * re * im;
        const re2 = zr2 + cr;
        const im2 = zi2 + ci;

        const dy = im2 - im;
        const dx = re2 - re;
        const r = project(Math.sqrt(dx * dx + dy * dy), 0, 2, 0, s2 / 2);
        const theta = Math.atan2(dy, dx);

        // draw a line of length s, centered as (x + s/2, y + s/2), with angle theta
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.beginPath();
        ctx.moveTo(x + s2 / 2, y + s2 / 2);
        ctx.lineTo(
          x + s2 / 2 + r * Math.cos(theta),
          y + s2 / 2 + r * Math.sin(theta)
        );
        ctx.stroke();

        // let shade = project(zr * zr + zi * zi, 0, 4, 0, 255);
        // if (Number.isNaN(shade)) {
        //   shade = 255;
        // }

        // if (shade < 0) {
        //   shade = 0;
        // }
        // if (shade > 255) {
        //   shade = 255;
        // }

        // ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        // ctx.fillRect(x, y, s, s);
      }
    }
  }
}

exports.Julia = Julia;

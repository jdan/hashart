const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class Spinner extends Art {
  constructor() {
    super({
      l1: 4,
      v1: 4,
      l2: 4,
      v2: 4,
    });
    this.filename = "pendulum.js";
    this.created = "12 Mar 2022";
  }

  getDescription() {
    return `
      Generate four numbers: Two representing the lengths of two arms, and two
      representing the speed at which they rotate. The two arms can range from
      0 to half the width of the canvas. The two speeds can range from -1/10 to
      1/10 (radians per unit of time).

      The first arm is affixed to the center of the canvas, and the second arm
      is affixed to the end of the first arm. Both arms begin pointing east.

      At each unit of time, increase the angle of the first arm according to
      <code>v1</code> without rotating the second arm. Then, increase the angle
      of the second arm according to <code>v2</code>. Draw a dot at the end of
      the second arm. Repeat this process 2000 times.
    `;
  }

  draw(ctx, { l1, l2, v1, v2 }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const s = Math.min(w, h);

    ctx.fillStyle = "rgb(0, 0, 0)";

    const FRAMES = 2000;
    for (let i = 0; i < FRAMES; i++) {
      const radialUnit = 1 / 5;

      const x =
        (l1 / 2) * Math.cos((v1 - 0.5) * i * radialUnit) +
        (l2 / 2) * Math.cos((v2 - 0.5) * i * radialUnit);
      const y =
        (l1 / 2) * Math.sin((v1 - 0.5) * i * radialUnit) +
        (l2 / 2) * Math.sin((v2 - 0.5) * i * radialUnit);

      ctx.beginPath();
      ctx.arc(
        project(x, -1, 1, w / 2 - s / 2, w / 2 + s / 2),
        project(y, -1, 1, h / 2 - s / 2, h / 2 + s / 2),
        _(4, s),
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }
}

exports.Spinner = Spinner;

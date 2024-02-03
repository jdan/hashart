const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

const G = 0.0000001;

class ThreeBody extends Art {
  constructor() {
    super({
      m1: 4,
      x1: 3,
      y1: 3,
      m2: 4,
      x2: 3,
      y2: 3,
      m3: 4,
      x3: 3,
      y3: 3,
    });
    this.filename = "three-body.js";
    this.created = "03 Feb 2024";
  }

  getDescription() {
    return `
      Place three bodies in space. Each body is defined by 10 bytes. The first 4 control
      its mass. The next 3 control its starting x position (0, 1). The next 3 control its
      starting y position (0, 1). All bodies start at rest.

      Then, simulate the gravitational forces between the bodies. We run the simulating 1000
      and use a value of ${G} for the gravitational constant.
    `;
  }

  arc(ctx, x, y, r) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const s = Math.min(w, h);

    const px = project(x, 0, 1, w / 2 - s / 2, w / 2 + s / 2);
    const py = project(y, 0, 1, h / 2 - s / 2, h / 2 + s / 2);

    ctx.arc(px, py, r, 0, 2 * Math.PI);
  }

  draw(ctx, { m1, x1, y1, m2, x2, y2, m3, x3, y3 }) {
    let body1 = { x: x1, y: y1, vx: 0, vy: 0 };
    let body2 = { x: x2, y: y2, vx: 0, vy: 0 };
    let body3 = { x: x3, y: y3, vx: 0, vy: 0 };

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.strokeStyle = "rgb(0, 0, 0)";

    const FRAMES = 1000;
    for (let i = 0; i < FRAMES; i++) {
      // graviational force between m1 and m2
      let d12 = Math.sqrt((body1.x - body2.x) ** 2 + (body1.y - body2.y) ** 2);
      let f12 = (G * m1 * m2) / d12 ** 2;
      let theta12 = Math.atan2(body2.y - body1.y, body2.x - body1.x);

      // graviational force between m1 and m3
      let d13 = Math.sqrt((body1.x - body3.x) ** 2 + (body1.y - body3.y) ** 2);
      let f13 = (G * m1 * m3) / d13 ** 2;
      let theta13 = Math.atan2(body3.y - body1.y, body3.x - body1.x);

      // graviational force between m2 and m3
      let d23 = Math.sqrt((body2.x - body3.x) ** 2 + (body2.y - body3.y) ** 2);
      let f23 = (G * m2 * m3) / d23 ** 2;
      let theta23 = Math.atan2(body3.y - body2.y, body3.x - body2.x);

      // Update position of m1
      let ax1 = (f12 * Math.cos(theta12) + f13 * Math.cos(theta13)) / m1;
      let ay1 = (f12 * Math.sin(theta12) + f13 * Math.sin(theta13)) / m1;
      body1.vx += ax1;
      body1.vy += ay1;
      body1.x += body1.vx;
      body1.y += body1.vy;

      // Update position of m2
      let ax2 = (-f12 * Math.cos(theta12) + f23 * Math.cos(theta23)) / m2;
      let ay2 = (-f12 * Math.sin(theta12) + f23 * Math.sin(theta23)) / m2;
      body2.vx += ax2;
      body2.vy += ay2;
      body2.x += body2.vx;
      body2.y += body2.vy;

      // Update position of m3
      let ax3 = (-f13 * Math.cos(theta13) - f23 * Math.cos(theta23)) / m3;
      let ay3 = (-f13 * Math.sin(theta13) - f23 * Math.sin(theta23)) / m3;
      body3.vx += ax3;
      body3.vy += ay3;
      body3.x += body3.vx;
      body3.y += body3.vy;

      ctx.beginPath();
      this.arc(ctx, body1.x, body1.y, 1);
      ctx.fill();

      ctx.beginPath();
      this.arc(ctx, body2.x, body2.y, 1);
      ctx.fill();

      ctx.beginPath();
      this.arc(ctx, body3.x, body3.y, 1);
      ctx.fill();
    }

    ctx.beginPath();
    this.arc(ctx, body1.x, body1.y, 10);
    ctx.stroke();

    ctx.beginPath();
    this.arc(ctx, body2.x, body2.y, 10);
    ctx.stroke();

    ctx.beginPath();
    this.arc(ctx, body3.x, body3.y, 10);
    ctx.stroke();
  }
}

exports.ThreeBody = ThreeBody;

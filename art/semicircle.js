const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Semicircle extends Art {
  constructor() {
    super({
      first: 5,
      second: 5,
      third: 5,
      fourth: 5,
    });
    this.filename = "semicircle.js";
    this.created = "25 May 2021";
  }

  getDescription({ firstBuffer }) {
    return `
      From the template we form ${
        Object.keys(this.template).length
      } semicircles,
      each built by extracting an <code>x, y, count, distance, direction</code> tuple from
      the buffer.
    `;
  }

  drawSemicircle(ctx, buffer) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // x and y from [0.25*w, 0.75*w]
    const x = (buffer[0] / 256) * (w / 2) + w / 4;
    const y = (buffer[0] / 256) * (h / 2) + h / 4;

    // fixed radius of 200
    const radius = _(200, Math.min(w, h));

    // count from 2 to 21
    const count = Math.floor((20 * buffer[2]) / 256) + 2;

    const distance = Math.floor((40 * buffer[3]) / 256) + 4;

    // theta is 0, pi/2, pi, or 3pi/2
    const theta = ((buffer[4] % 4) * Math.PI) / 2;

    for (let i = 0; i < count; i++) {
      // Compute the center of the flat edge
      const x_ = x + i * distance * Math.cos(theta + Math.PI / 2);
      const y_ = y + i * distance * Math.sin(theta + Math.PI / 2);

      ctx.lineWidth = 3;

      ctx.beginPath();

      // flat side
      ctx.moveTo(x_ - radius * Math.cos(theta), y_ - radius * Math.sin(theta));
      ctx.lineTo(x_ + radius * Math.cos(theta), y_ + radius * Math.sin(theta));

      // curve
      ctx.arc(x_, y_, radius, theta, theta + Math.PI);

      ctx.stroke();
    }
  }

  draw(ctx, { firstBuffer, secondBuffer, thirdBuffer, fourthBuffer }) {
    [firstBuffer, secondBuffer, thirdBuffer, fourthBuffer].forEach((buff) => {
      this.drawSemicircle(ctx, buff);
    });
  }
}

exports.Semicircle = Semicircle;

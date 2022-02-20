const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class Knots extends Art {
  constructor() {
    super({
      values: 32,
    });

    this.filename = "knots.js";
    this.created = "20 Feb 2022";
  }

  getDescription() {
    return `
		  For each byte in in the buffer, place a point on a line. Extend an arc
		  from the previous point to the current point - alternating between above
			and below the horizon. The radius of the arc should be halfway the distance
			between the two points.

			This technique comes from an excellent Numberphile video on the
			<a href="https://www.youtube.com/watch?v=FGC5TdIiT9U">Recamán sequence</a>.

			I previously used this technique to draw knots using the values of the
			<a href="https://github.com/jdan/collatz.now.sh">Collatz sequence</a>, instead
			of random numbers from a hash as in this piece.
    `;
  }

  draw(ctx, { valuesBuffer }) {
    // Side length of the bounding box
    const s = Math.min(ctx.canvas.width, ctx.canvas.height);

    // Width of 3 based on `s`
    ctx.lineWidth = _(3, s);

    // Padding on either side
    const PADDING = 0.1 * s;

    for (let i = 1; i < valuesBuffer.length; i++) {
      const a = project(valuesBuffer[i - 1], 0, 255, PADDING, s - PADDING);
      const b = project(valuesBuffer[i], 0, 255, PADDING, s - PADDING);
      const midpoint = (a + b) / 2;

      ctx.beginPath();

      ctx.arc(
        // Compute the x-coordinate of the center
        ctx.canvas.width / 2 - s / 2 + midpoint,

        // y-coordinate is always halfway up
        ctx.canvas.height / 2,

        // radius is half the distance between `a` and `b`
        Math.abs(a - b) / 2,

        // We want the arc to be above the line, then below the line
        i % 2 ? 0 : Math.PI,
        i % 2 ? Math.PI : 2 * Math.PI
      );

      ctx.stroke();
    }
  }
}

exports.Knots = Knots;

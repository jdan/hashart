const { Art } = require("./_base.js");
const { _, project } = require("./util.js");
const V = require("voronoi");

const NUM_POINTS = 16;

class Voronoi extends Art {
  constructor() {
    super({
      x: 1,
      y: 1,
      others: (NUM_POINTS - 1) * 2,
    });

    this.filename = "voronoi.js";
    this.created = "30 Dec 2022";
  }

  getDescription() {
    return `
      Read ${NUM_POINTS} byte pairs from the array, representing
      a series of (x, y) points. Do not draw the points on the canvas. Partition
      the plane into a <a href="https://en.wikipedia.org/wiki/Voronoi_diagram">Voronoi diagram</a>,
      identifying regions of the graph which are closest to each point.

      Under the hood we use <a href="https://twitter.com/gorhill">@gorhill</a>'s excellent
      <a href="https://github.com/gorhill/Javascript-Voronoi">Voronoi library</a>,
      which took no time at all to plug in.
    `;
  }

  draw(ctx, { xBuffer, yBuffer, othersBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.lineWidth = _(5, w);

    const voronoiGenerator = new V();

    const coords = [...xBuffer, ...yBuffer, ...othersBuffer];
    const vertices = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      vertices.push({
        x: project(coords[2 * i], 0, 256, 0, w),
        y: project(coords[2 * i + 1], 0, 256, 0, h),
      });
    }

    const { edges } = voronoiGenerator.compute(vertices, {
      xl: 0,
      xr: w,
      yt: 0,
      yb: h,
    });

    for (let i = 0; i < edges.length; i++) {
      ctx.beginPath();
      ctx.moveTo(edges[i].va.x, edges[i].va.y);
      ctx.lineTo(edges[i].vb.x, edges[i].vb.y);
      ctx.stroke();
    }
  }
}

exports.Voronoi = Voronoi;

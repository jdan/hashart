const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

const NUM_POINTS = 12;

class Network extends Art {
  constructor() {
    super({
      x: 1,
      y: 1,
      others: (NUM_POINTS - 1) * 2,
    });
    this.filename = "network.js";
    this.created = "22 May 2022";
  }

  getDescription() {
    return `
      Read ${NUM_POINTS} byte pairs from the array, representing
      a series of (x, y) points. Draw each point on the canvas,
      connecting it to every other point.

      Then, determine the
      <a href="https://en.wikipedia.org/wiki/Minimum_spanning_tree">Minimum spanning tree</a>
      of the points: the continguous series of lines which connect to every point
      while minimizing the total length of the lines.

      You can use
      <a href="https://en.wikipedia.org/wiki/Kruskal%27s_algorithm">Kruskal's algorithm</a>
      to determine this.

      <pre>
  algorithm Kruskal(G) is
    F:= ∅
    for each v ∈ G.V do
        MAKE-SET(v)
    for each (u, v) in G.E ordered by weight(u, v), increasing do
        if FIND-SET(u) ≠ FIND-SET(v) then
            F:= F ∪ {(u, v)} ∪ {(v, u)}
            UNION(FIND-SET(u), FIND-SET(v))
    return F</pre>

      Draw the lines in the Minimum spanning tree in bold.
    `;
  }

  kruskal({ edges, vertices }) {
    // https://en.wikipedia.org/wiki/Kruskal%27s_algorithm
    //
    // F:= ∅
    // for each v ∈ G.V do
    //     MAKE-SET(v)
    // for each (u, v) in G.E ordered by weight(u, v), increasing do
    //     if FIND-SET(u) ≠ FIND-SET(v) then
    //         F:= F ∪ {(u, v)} ∪ {(v, u)}
    //         UNION(FIND-SET(u), FIND-SET(v))
    // return F

    const F = new Set([]);
    const disjointSets = new Set(
      vertices.map((v) => new Set([`${v[0]},${v[1]}`]))
    );

    const sortedEdges = edges.slice();
    sortedEdges.sort((e1, e2) => {
      // Oh dear
      const d1 =
        (e1[0][0] - e1[1][0]) * (e1[0][0] - e1[1][0]) +
        (e1[0][1] - e1[1][1]) * (e1[0][1] - e1[1][1]);
      const d2 =
        (e2[0][0] - e2[1][0]) * (e2[0][0] - e2[1][0]) +
        (e2[0][1] - e2[1][1]) * (e2[0][1] - e2[1][1]);
      return d1 - d2;
    });

    console.log(
      sortedEdges.map(
        ([u, v]) =>
          (u[1] - u[0]) * (u[1] - u[0]) + (v[1] - v[0]) * (v[1] - v[0])
      )
    );

    sortedEdges.forEach(([u, v]) => {
      const uSet = [...disjointSets].find((set) => set.has(`${u[0]},${u[1]}`));
      const vSet = [...disjointSets].find((set) => set.has(`${v[0]},${v[1]}`));

      if (uSet !== vSet) {
        F.add([u, v]);
        disjointSets.delete(uSet);
        disjointSets.delete(vSet);
        disjointSets.add(new Set([...uSet, ...vSet]));
      }
    });

    return [...F];
  }

  draw(ctx, { xBuffer, yBuffer, othersBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const coords = [...xBuffer, ...yBuffer, ...othersBuffer];

    const vertices = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      vertices.push([coords[2 * i], coords[2 * i + 1]]);
    }

    const edges = [];
    for (let i = 0; i < NUM_POINTS - 1; i++) {
      for (let j = i + 1; j < NUM_POINTS; j++) {
        edges.push([
          [coords[2 * i], coords[2 * i + 1]],
          [coords[2 * j], coords[2 * j + 1]],
        ]);
      }
    }

    // Padding
    const p = _(120, w);

    // Draw the network of lines
    ctx.lineWidth = _(1, w);
    edges.forEach((edge) => {
      ctx.beginPath();
      ctx.moveTo(
        project(edge[0][0], 0, 256, p, w - p),
        project(edge[0][1], 0, 256, p, h - p)
      );
      ctx.lineTo(
        project(edge[1][0], 0, 256, p, w - p),
        project(edge[1][1], 0, 256, p, h - p)
      );
      ctx.stroke();
    });

    // Draw the minimum spanning tree
    const mst = this.kruskal({ edges, vertices });
    ctx.lineWidth = _(10, w);
    mst.forEach((edge) => {
      ctx.beginPath();
      ctx.moveTo(
        project(edge[0][0], 0, 256, p, w - p),
        project(edge[0][1], 0, 256, p, h - p)
      );
      ctx.lineTo(
        project(edge[1][0], 0, 256, p, w - p),
        project(edge[1][1], 0, 256, p, h - p)
      );
      ctx.stroke();
    });

    // Draw circles for every node
    ctx.fillStyle = `rgb(255, 255, 255)`;
    vertices.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(
        project(x, 0, 256, p, w - p),
        project(y, 0, 256, p, h - p),
        _(15, w),
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
    });
  }
}

exports.Network = Network;

function _(measurement, width) {
  // Map a measurement on a 1320px to a given width
  return Math.round((measurement * width) / 1320);
}

class Art {
  constructor(template) {
    if (!template) {
      throw "input template must be used";
    }
    this.template = template;
  }

  templateEntries() {
    let usedBytes = Object.values(this.template).reduce((a, b) => a + b, 0);
    return Object.entries(this.template).concat(
      usedBytes < 32 ? [["unused", 32 - usedBytes]] : []
    );
  }

  explanation(buff) {
    let buffer = new Uint8Array(buff);
    let idx = 0;
    let segments = [];

    for (let [name, bytes] of this.templateEntries()) {
      let slice = buffer.slice(idx, idx + bytes);
      segments.push({
        name,
        bytes: Array.prototype.map
          .call(slice, (x) => ("00" + x.toString(16)).slice(-2))
          .join(""),
        normalized: this.normalize(slice),
      });

      idx += bytes;
    }

    return segments;
  }

  normalize(buffer) {
    if (buffer.byteLength === 0) {
      return 0;
    } else {
      return buffer[0] / 0x100 + this.normalize(buffer.slice(1)) / 0x100;
    }
  }

  render(ctx, buffer) {
    let idx = 0;
    let obj = {};

    for (let [name, bytes] of Object.entries(this.template)) {
      const slice = buffer.slice(idx, idx + bytes);
      obj[name + "Buffer"] = slice;
      obj[name] = this.normalize(slice);

      idx += bytes;
    }

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.draw(ctx, obj);
    ctx.restore();
  }

  draw() {
    throw "Child class must implement draw()";
  }
}

class Circle extends Art {
  constructor() {
    super({
      x1: 2,
      y1: 2,
      r1: 2,
      // prettier-ignore
      "θ1": 1,
      d1: 1,

      x2: 2,
      y2: 2,
      r2: 2,
      // prettier-ignore
      "θ2": 1,
      d2: 1,
    });
  }

  shadedCircle(ctx, { style, x, y, r, theta, d }) {
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();

    // only shade for small enough distances
    if (d > 0 && d < 20) {
      for (let myd = r - d; myd > -r; myd -= d) {
        let mytheta = Math.acos(myd / r);
        ctx.beginPath();
        ctx.moveTo(
          x + r * Math.cos(mytheta + theta),
          y + r * Math.sin(mytheta + theta)
        );
        ctx.lineTo(
          x + r * Math.cos(-mytheta + theta),
          y + r * Math.sin(-mytheta + theta)
        );
        ctx.stroke();
      }
    }
  }

  draw(ctx, { x1, y1, r1, d1, x2, y2, r2, d2, ...obj }) {
    this.shadedCircle(ctx, {
      style: "rgb(100, 100, 100)",
      x: x1 * ctx.canvas.width,
      y: y1 * ctx.canvas.height,
      r: r1 * ctx.canvas.width,
      theta: obj["θ1"] * Math.PI,
      d: d1 * 100,
    });

    this.shadedCircle(ctx, {
      style: "rgb(51, 51, 51)",
      x: x2 * ctx.canvas.width,
      y: y2 * ctx.canvas.height,
      r: r2 * ctx.canvas.width,
      theta: obj["θ2"] * Math.PI,
      d: d2 * 200,
    });
  }
}

class Boxes extends Art {
  constructor() {
    super({
      w1: 2,
      d1: 2,
      h1: 2,

      w2: 2,
      d2: 2,
      h2: 2,

      w3: 2,
      d3: 2,
      h3: 2,
    });
  }

  coordToIso(x, y, z) {
    return [x + 0.4 * z, y - 0.2 * z];
  }

  drawBox(ctx, { x, y, d, w, h }) {
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

  draw(ctx, { w1, d1, h1, w2, d2, h2, w3, d3, h3 }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const x = 0.25 * w;
    const y = 0.7 * h;

    const wMin = _(20, w);
    const dScale = _(400, w);
    const wScale = _(300, w);
    const hScale = _(600, w);

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
  }
}

class Stocks extends Art {
  constructor() {
    super({
      name: 4,
      date: 2,
      open: 1,
      moves: 25,
    });
  }

  draw(ctx, { nameBuffer, date, open, movesBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Name
    const name = Array.from(nameBuffer)
      .map((b) => String.fromCharCode((b % 26) + 65))
      .join("");
    ctx.font = `${_(80, w)}px monospace`;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("$" + name, _(60, w), h - _(80, w));

    // Graph
    const leftPadding = _(220, w);
    const topPadding = _(140, w);
    const bottomPadding = _(400, w);
    let barWidth = _(20, w);
    // Make barWidth an odd number
    barWidth = barWidth % 2 === 0 ? barWidth + 1 : barWidth;
    const halfBarWidth = Math.floor(barWidth / 2) + 1;

    const barDistance = _(40, w);

    const sticks = [];
    let lastClose = open * 128 + 50;
    for (let i = 0; i < movesBuffer.byteLength; i++) {
      const closeVariance = 10;
      const lowHighVariance = 5;

      const open = lastClose;
      const close = Math.sin(0.1337 * movesBuffer[i]) * closeVariance + open;
      const low =
        Math.min(open, close) -
        Math.abs(Math.sin(0.4242 * movesBuffer[i]) * lowHighVariance);
      const high =
        Math.max(open, close) +
        Math.abs(Math.sin(0.1729 * movesBuffer[i]) * lowHighVariance);

      lastClose = close;

      sticks.push([low, open, close, high]);
    }

    const min = Math.min(...sticks.map((v) => v[0]));
    const max = Math.max(...sticks.map((v) => v[3]));

    sticks
      // map [low, open, close, high] to canvas y-coordinates
      .map((stick) =>
        stick.map(
          (el) =>
            ((el - min) / (max - min)) * (h - (topPadding + bottomPadding)) +
            topPadding
        )
      )
      .forEach(([low, open, close, high], i) => {
        const x = leftPadding + i * barDistance;

        ctx.beginPath();

        ctx.moveTo(x + halfBarWidth, low);
        ctx.lineTo(x + halfBarWidth, Math.min(open, close));

        ctx.moveTo(x + halfBarWidth, high);
        ctx.lineTo(x + halfBarWidth, Math.max(open, close));

        ctx.rect(x, open, barWidth, close - open);
        ctx.stroke();
      });

    // Labels
    const labelPadding = _(64, w);
    ctx.font = `${_(30, w)}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(
      `${movesBuffer.byteLength}d high: ${max.toFixed(2)}`,
      w - _(80, w),
      h - _(120, w)
    );
    ctx.fillText(
      `${movesBuffer.byteLength}d low: ${min.toFixed(2)}`,
      w - _(80, w),
      h - _(80, w)
    );

    // Dates
    ctx.font = `${_(20, w)}px monospace`;
    ctx.textAlign = "left";

    function dateFromDay(year, day) {
      var date = new Date(year, 0); // initialize a date in `year-01-01`
      return new Date(date.setDate(day)); // add the number of days
    }

    const firstDay = Math.floor(date * 365);

    const markers = 4;

    for (let i = 0; i < markers + 1; i++) {
      const date = dateFromDay(
        2021,
        firstDay + i * ((movesBuffer.byteLength - 1) / markers)
      );

      ctx.textAlign = "center";
      ctx.fillText(
        `${date.getMonth() + 1}/${date.getDate()}`,
        leftPadding +
          barDistance * i * ((movesBuffer.byteLength - 1) / markers) +
          halfBarWidth,
        h - bottomPadding + labelPadding
      );
    }

    // Prices
    ctx.textAlign = "right";
    ctx.fillText(max.toFixed(2), leftPadding - labelPadding, topPadding);
    ctx.fillText(min.toFixed(2), leftPadding - labelPadding, h - bottomPadding);
    ctx.fillText(
      ((max + min) / 2).toFixed(2),
      leftPadding - labelPadding,
      (topPadding + h - bottomPadding) / 2
    );
  }
}

module.exports = {
  circles: Circle,
  boxes: Boxes,
  stocks: Stocks,
};

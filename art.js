function _(measurement, dimension) {
  // Map from [0, 1320] to [0, dimension]
  //
  // Useful when we know a width of "200" looks good at 1320px and
  // want to scale it.
  return Math.round((measurement * dimension) / 1320);
}

class Art {
  constructor(template) {
    if (!template) {
      throw "input template must be used";
    }
    this.template = template;
  }

  getDescription() {
    return null;
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
      r1: 2,
      x2: 2,
      r2: 2,
      x3: 2,
      r3: 2,
      x4: 2,
      r4: 2,
    });
  }

  getDescription() {
    return `
      From the template we gather ${
        Object.keys(this.template).length / 2
      } circles and their radii and place
      them on the horizon. Intersections of these circles (if any) are labeled by drawing a chord between the two
      intersection points.
    `;
  }

  drawCircle(ctx, x, r) {
    const h = ctx.canvas.height;
    ctx.beginPath();
    ctx.arc(x, h / 2, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  drawIntersection(ctx, x1, r1, x2, r2) {
    const h = ctx.canvas.height;
    const d = x2 - x1;

    // https://mathworld.wolfram.com/Circle-CircleIntersection.html
    const intersectionOffset = (d * d - r2 * r2 + r1 * r1) / (2 * d);
    const y = Math.sqrt(
      (4 * d * d * r1 * r1 - Math.pow(d * d - r2 * r2 + r1 * r1, 2)) /
        (4 * d * d)
    );

    ctx.beginPath();
    ctx.moveTo(x1 + intersectionOffset, h / 2 - y);
    ctx.lineTo(x1 + intersectionOffset, h / 2 + y);
    ctx.stroke();
  }

  draw(ctx, { x1, r1, x2, r2, x3, r3, x4, r4 }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const xs = [x1, x2, x3, x4].map((x) => Math.round(x * w));
    const rs = [r1, r2, r3, r4].map((r) => r * 0.6 * w);

    xs.forEach((x, i) => {
      this.drawCircle(ctx, x, rs[i]);
    });

    // Pair up each circle to draw an intersection chord (if any)
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ].forEach(([a, b]) => {
      this.drawIntersection(ctx, xs[a], rs[a], xs[b], rs[b]);
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

  getDescription() {
    return `
      From the template we gather dimensions for ${
        Object.keys(this.template).length / 3
      } boxes and place them
      next to each other on the ground. The boxes are rendered isometrically with a front-facing light source.
    `;
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

  getDescription() {
    return `
      We generate a ${this.template.moves}-day <a href="https://en.wikipedia.org/wiki/Candlestick_chart">Candlestick chart</a>
      using the <code>name</code> buffer to compute a random 4-digit stock symbol.
      The stock opens at a random value specified by <code>open</code> on a random day generated
      from <code>date</code>. For each byte in the <code>moves</code> buffer we generate a
      <code>close</code>, <code>high</code>, and <code>low</code> using the following equations.

      const close = Math.sin(0.1337 * movesBuffer[i]) * closeVariance + open;

      const low =
        Math.min(open, close) -
        Math.abs(Math.sin(0.4242 * movesBuffer[i]) * lowHighVariance);

      const high =
        Math.max(open, close) +
        Math.abs(Math.sin(0.1729 * movesBuffer[i]) * lowHighVariance);

      These four numbers are used to draw each candlestick, and the global high and low are
      rendered in the bottom right.
    `;
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
    const leftPadding = _(236, w);
    const topPadding = _(140, h);
    const bottomPadding = _(400, h);
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
    ctx.font = `${_(36, w)}px monospace`;
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
    ctx.font = `${_(30, w)}px monospace`;
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

class Collatz extends Art {
  constructor() {
    super({
      input: 8,
    });
  }

  getDescription() {
    return `
      We convert <code>input</code> to a number, and use it as the first number in a
      <a href="https://en.wikipedia.org/wiki/Collatz_conjecture#Statement_of_the_problem">Collatz sequence</a>
      (i.e. even n => n / 2, odd n => 3n+1) until the number reaches 1.

      Each iteration is drawn as a bit string where 1s are filled and 0s are empty, continuing to the next line and
      wrapping back to the top when necessary.

      It is unknown if the Collatz sequence reaches 1 for every input, but we know that
      <a href="https://en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations">generalized Collatz sequences</a>
      can be used to perform arbitrary computations and their behavior is therefore undecidable.
    `;
  }

  bitSize(ctx) {
    return _(8, ctx.canvas.height);
  }

  bufferToBitString(buff) {
    let arr = [];
    for (let i = 0; i < buff.byteLength; i++) {
      arr = arr.concat(
        buff[i]
          .toString(2)
          .padStart(8, "0")
          .split("")
          .map((s) => parseInt(s))
      );
    }
    return arr;
  }

  halfBitString(bitString) {
    return bitString.slice(1);
  }

  addBitString(a, b) {
    const result = [];
    const maxLength = Math.max(a.length, b.length);
    let carry = 0;
    for (let i = 0; i < maxLength; i++) {
      const a_ = a[i] || 0;
      const b_ = b[i] || 0;
      const sum = a_ + b_ + carry;
      result.push(sum % 2);
      carry = sum > 1 ? 1 : 0;
    }
    if (carry) {
      result.push(carry);
    }
    return result;
  }

  triplePlusOneBitString(bitString) {
    const doubleBitString = [0].concat(bitString);
    return this.addBitString(
      // 3n
      this.addBitString(bitString, doubleBitString),
      // +1
      [1]
    );
  }

  drawBitString(ctx, x, y, bitString) {
    const bs = this.bitSize(ctx);
    for (let i = 0; i < bitString.length; i++) {
      if (bitString[i]) {
        ctx.beginPath();
        ctx.rect(x + i * bs, y, bs, bs);
        ctx.fill();
      }
    }
  }

  draw(ctx, { inputBuffer }) {
    const bs = this.bitSize(ctx);
    let x = 0;
    let y = 0;
    let current = this.bufferToBitString(inputBuffer);

    let maxWidthOfColumn = 0;

    ctx.fillStyle = "rgb(0, 0, 0)";

    while (current.length > 0 && x * bs <= ctx.canvas.width) {
      maxWidthOfColumn = Math.max(maxWidthOfColumn, current.length);
      this.drawBitString(ctx, x * bs, y * bs, current);

      // Make sure we draw the `1` bit :)
      if (current.length == 1) {
        break;
      }

      current = current[0]
        ? this.triplePlusOneBitString(current)
        : this.halfBitString(current);
      y++;

      const GAP = 2;
      if (y * bs >= ctx.canvas.height) {
        y = 0;
        x += maxWidthOfColumn + GAP;
        maxWidthOfColumn = 0;
      }
    }
  }
}

module.exports = {
  circles: Circle,
  boxes: Boxes,
  stocks: Stocks,
  collatz: Collatz,
};

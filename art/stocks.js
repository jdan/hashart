const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Stocks extends Art {
  constructor() {
    super({
      name: 4,
      date: 2,
      open: 1,
      moves: 25,
    });
    this.filename = "stocks.js";
    this.created = "18 Apr 2021";
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
    const s = Math.min(w, h);

    // Name
    const name = Array.from(nameBuffer)
      .map((b) => String.fromCharCode((b % 26) + 65))
      .join("");
    ctx.font = `${_(80, s)}px monospace`;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("$" + name, _(60, w), h - _(80, h));

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
    ctx.font = `${_(36, s)}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(
      `${movesBuffer.byteLength}d high: ${max.toFixed(2)}`,
      w - _(80, w),
      h - _(120, h)
    );
    ctx.fillText(
      `${movesBuffer.byteLength}d low: ${min.toFixed(2)}`,
      w - _(80, w),
      h - _(80, h)
    );

    // Dates
    ctx.font = `${_(30, s)}px monospace`;
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

exports.Stocks = Stocks;

const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Fraction extends Art {
  constructor() {
    super({
      a: 6,
      b: 6,
    });
    this.filename = "fraction.js";
    this.created = "29 Apr 2021";
  }

  getDescription() {
    return `
      Convert <code>a</code> and <code>b</code> into integers and form them into a proper fraction
      (a fraction whose numerator is less than the denominator).

      We then show the process of turning this fraction into a sum of unit fractions. This is commonly
      referred to as an <a href="https://en.wikipedia.org/wiki/Egyptian_fraction">Egyptian fraction</a>.

      In particular, our algorithm for doing so is a
      <a href="https://en.wikipedia.org/wiki/Greedy_algorithm_for_Egyptian_fractions">greedy one</a>.
      The numbers grow fast very quickly.
    `;
  }

  bigIntOfBuffer(buffer) {
    let res = 0n;
    buffer.forEach((item, idx) => {
      res *= 256n;
      res += BigInt(item);
    });
    return res;
  }

  drawFraction(ctx, fontSize, lineHeight, numer, denom, x, y, maxWidth) {
    // If we've halted iteration or run into an error
    if (denom === "...") {
      ctx.fillText("...", x, y + lineHeight);
      return ctx.measureText("...");
    }

    const oneCharWidth = ctx.measureText("0").width;
    const numerWidth = ctx.measureText(numer.toString()).width;
    const denomWidth = Math.min(
      Math.floor(maxWidth / oneCharWidth) * oneCharWidth,
      ctx.measureText(denom.toString()).width
    );

    ctx.fillText(
      numer.toString(),
      x + (denomWidth - numerWidth) / 2,
      y + fontSize
    );
    ctx.beginPath();
    ctx.moveTo(x, y + lineHeight);
    ctx.lineTo(x + denomWidth, y + lineHeight);
    ctx.stroke();

    const charsPerLine = Math.floor(maxWidth / oneCharWidth);
    const denomString = denom.toString();
    let line = 0;

    for (let idx = 0; idx < denomString.length; idx += charsPerLine, line++) {
      ctx.fillText(
        denomString.slice(idx, idx + charsPerLine),
        x,
        y + fontSize * (line + 2)
      );
    }

    return {
      width: denomWidth,
      height: lineHeight + line * fontSize,
    };
  }

  draw(ctx, { aBuffer, bBuffer }) {
    const a = this.bigIntOfBuffer(aBuffer);
    const b = this.bigIntOfBuffer(bBuffer);

    let numer = a < b ? a : b;
    let denom = a < b ? b : a;
    const fractions = [];

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const leftPadding = _(30, w);
    const topPadding = _(30, h);

    const f = 20;
    const fontSize = _(f, w);
    const lineHeight = _(f * 1.2, w);

    const equationPadding = _(30, w);

    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = "rgb(0, 0, 0)";
    const equalsSignWidth = ctx.measureText("=").width;

    const fractionWidth = this.drawFraction(
      ctx,
      fontSize,
      lineHeight,
      numer,
      denom,
      leftPadding,
      topPadding,
      Infinity // lol
    ).width;

    const room =
      w -
      2 * leftPadding -
      fractionWidth -
      equalsSignWidth -
      2 * equationPadding;

    let idx = 0;
    const MAX_ITERATION = 15;
    for (; numer > 0 && idx < MAX_ITERATION; idx++) {
      if (denom % numer === 0n) {
        fractions.push(denom / numer);
        break;
      }

      let greedy = denom / numer + 1n;
      fractions.push(greedy);

      // numer/denom - 1/greedy
      // (numer*greedy)/(denom*greedy) - denom/(denom*greedy)
      try {
        numer = numer * greedy - denom;
        denom = denom * greedy;
      } catch (e) {
        break;
      }
    }

    // If we've run into an error or halted iteration for time
    if (denom % numer !== 0n) {
      fractions.push("...");
    }

    let y = topPadding;
    fractions.forEach((denom, idx) => {
      // draw = or +
      ctx.fillText(
        idx === 0 ? "=" : "+",
        leftPadding + fractionWidth + equationPadding,
        y + 1.25 * lineHeight // 1.25 is arbitrary but the equals sign is not very tall
      );

      // draw fraction
      const { height } = this.drawFraction(
        ctx,
        fontSize,
        lineHeight,
        1,
        denom,
        leftPadding + fractionWidth + equalsSignWidth + 2 * equationPadding,
        y,
        room
      );

      y += height;
    });
  }
}

exports.Fraction = Fraction;

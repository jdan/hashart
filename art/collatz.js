const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Collatz extends Art {
  constructor() {
    super({
      input: 8,
    });
    this.filename = "collatz.js";
    this.created = "14 Apr 2021";
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

exports.Collatz = Collatz;

const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Automata extends Art {
  constructor() {
    super({
      rule: 1,
      seed: 4,
    });
    this.filename = "automata.js";
    this.created = "26 Feb 2022";
  }

  getDescription(params) {
    return `
      TBD
    `;
  }

  ruleToLookup(rule) {
    const bits = rule.toString(2).padStart(8, "0");
    return {
      111: bits[0],
      110: bits[1],
      101: bits[2],
      100: bits[3],
      "011": bits[4],
      "010": bits[5],
      "001": bits[6],
      "000": bits[7],
    };
  }

  nextRow(row, lookup) {
    const nextRow = row.slice();
    for (let i = 0; i < row.length; i++) {
      const seq = [row[i - 1] || 0, row[i] || 0, row[i + 1] || 0].join("");
      nextRow[i] = lookup[seq];
    }
    return nextRow;
  }

  drawRow(ctx, row, bitSize, y) {
    const widthInBits = Math.floor(ctx.canvas.width / bitSize);
    const start = Math.floor(row.length / 2 - widthInBits / 2);
    const end = Math.floor(row.length / 2 + widthInBits / 2);

    for (let i = start; i < end; i++) {
      const x = (i - start) * bitSize;
      if (row[i] === "1") {
        ctx.fillStyle = `rgb(0, 0, 0)`;
        ctx.beginPath();
        ctx.rect(x, y, bitSize, bitSize);
        ctx.fill();
      }
    }
  }

  bufferToBinary(buffer) {
    let base10 = buffer.reduce((acc, d) => acc * 256 + d, 1);
    return base10
      .toString(2)
      .split("")
      .map((d) => parseInt(d));
  }

  draw(ctx, { ruleBuffer, seedBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // 12px bits at 1200px looks decent
    const bitSize = _(12, w);

    // Initialize an array large enough to handle all possible growth
    let row = Array.from({
      length: Math.floor((w + h + h) / bitSize),
    }).map((_) => 0);

    // Place `seed` on the tape
    const input = this.bufferToBinary(seedBuffer);
    for (let i = 0; i < input.length; i++) {
      const idx = Math.floor(row.length / 2 - input.length / 2) + i;
      row[idx] = input[i];
    }

    const lookup = this.ruleToLookup(ruleBuffer[0]);
    for (let i = 0; i < Math.floor(h / bitSize) + 1; i++) {
      row = this.nextRow(row, lookup);
      this.drawRow(ctx, row, bitSize, i * bitSize);
    }
  }
}

exports.Automata = Automata;

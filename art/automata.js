const { Art } = require("./_base.js");
const { _, project } = require("./util.js");

class Automata extends Art {
  constructor() {
    super({
      rule: 1,
      seed: 4,
      size: 2,
    });
    this.filename = "automata.js";
    this.created = "26 Feb 2022";
  }

  getDescription({ rule, seedBuffer }) {
    return `
      Begin with an empty row of 0's and populate the center
      with a bitstring taken from <code>seed</code>.

      Build a <a href="https://en.wikipedia.org/wiki/Rule_110#Definition">table</a>
      by converting <code>rule</code> to binary, and pairing each bit with a
      number starting from 7 and decreasing to 0. For our above seed, rule ${
        rule * 256
      } will generate the following table:

      <table cellpadding="5" border="1">
        <tr>
          <th>seq</th>
          ${this.ruleToLookup(rule * 256)
            .map(([seq, _]) => `<td>${seq}</td>`)
            .join("\n")}
        </tr>
        <tr>
          <th>val</th>
          ${this.ruleToLookup(rule * 256)
            .map(([_, val]) => `<td>${val}</td>`)
            .join("\n")}
        </tr>
      </table>

      For each bit in the row, generate a three-bit string using the bit to
      its left, the bit itself, and the bit to its right. Look up this value
      in the table above, and assign <code>val</code> as the new bit.

      Finally draw the resulting row on the next line of the canvas.
    `;
  }

  ruleToLookup(rule) {
    const bits = Math.floor(rule).toString(2).padStart(8, "0");
    return ["111", "110", "101", "100", "011", "010", "001", "000"].map(
      (seq, idx) => [seq, bits[idx]]
    );
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

  draw(ctx, { size, rule, seedBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // 12px bits at 1200px looks decent
    const bitSize = _(project(size, 0, 1, 3, 12), w);

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

    const lookup = Object.fromEntries(this.ruleToLookup(rule * 256));
    for (let i = 0; i < Math.floor(h / bitSize) + 1; i++) {
      row = this.nextRow(row, lookup);
      this.drawRow(ctx, row, bitSize, i * bitSize);
    }
  }
}

exports.Automata = Automata;

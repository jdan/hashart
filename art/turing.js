const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Turing extends Art {
  constructor() {
    super({
      "α₀": 3,
      "β₀": 3,
      "γ₀": 3,
      "δ₀": 3,
      "α₁": 3,
      "β₁": 3,
      "γ₁": 3,
      "δ₁": 3,
    });
    this.filename = "turing.js";
    this.created = "28 May 2021";
  }

  transitionTable(params) {
    function triplet(key) {
      return {
        write: Math.floor((params[key + "Buffer"][0] / 256) * 2),
        move: Math.floor((params[key + "Buffer"][1] / 256) * 2),
        nextState: "αβγδ"[Math.floor((params[key + "Buffer"][0] / 256) * 4)],
      };
    }

    return {
      0: {
        α: triplet("α₀"),
        β: triplet("β₀"),
        γ: triplet("γ₀"),
        δ: triplet("δ₀"),
      },
      1: {
        α: triplet("α₁"),
        β: triplet("β₁"),
        γ: triplet("γ₁"),
        δ: triplet("δ₁"),
      },
    };
  }

  transitionTableHtml(params) {
    const table = this.transitionTable(params);
    const body = [0, 1]
      .map((i) => {
        const row = "αβγδ"
          .split("")
          .map((state) => {
            const entry = table[i][state];
            return `
            <td>${entry.write}</td>
            <td>${entry.move ? "R" : "L"}</td>
            <td><strong>${entry.nextState}</strong></td>
          `;
          })
          .join("");

        return `
        <tr>
          <td>${i}</td>
          ${row}
        </tr>
      `;
      })
      .join("");

    return `
      <table cellpadding="3" border="1">
        <thead>
          <tr>
            <th rowspan="2"></th>
            <th colspan="3">State α</th>
            <th colspan="3">State β</th>
            <th colspan="3">State γ</th>
            <th colspan="3">State δ</th>
          </tr>
          <tr>
            <td>Write</td>
            <td>Move</td>
            <td>State</td>
            <td>Write</td>
            <td>Move</td>
            <td>State</td>
            <td>Write</td>
            <td>Move</td>
            <td>State</td>
            <td>Write</td>
            <td>Move</td>
            <td>State</td>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  getDescription(params) {
    return `
      We illustrate a 4-state <a href="https://en.wikipedia.org/wiki/Turing_machine">Turing machine</a>
      with the following transition table:

      ${this.transitionTableHtml(params)}
    `;
  }

  transition(table, tape, cursorPosition, state) {
    let value = tape[cursorPosition];
    let { write, move, nextState } = table[value][state];

    tape[cursorPosition] = write;
    return [move ? cursorPosition + 1 : cursorPosition - 1, nextState];
  }

  drawTape(ctx, tape, bitSize, y) {
    ctx.fillStyle = "rgb(0, 0, 0)";

    console.log(tape);

    const start = Math.floor(tape.length / 4);
    const end = Math.floor((3 / 4) * tape.length);
    for (let i = start; i < end; i++) {
      if (tape[i]) {
        ctx.beginPath();
        ctx.rect((i - start) * bitSize, y, bitSize, bitSize);
        ctx.fill();
      }
    }
  }

  draw(ctx, params) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const bitSize = _(8, w);
    let tape = Array.from({
      length: 2 * Math.floor(Math.max(w, h) / bitSize) + 2,
    }).map((_) => 0);
    let cursorPosition = Math.floor(tape.length / 2);
    let state = "α";

    const table = this.transitionTable(params);

    for (let i = 0; i < Math.floor(h / bitSize) + 1; i++) {
      [cursorPosition, state] = this.transition(
        table,
        tape,
        cursorPosition,
        state
      );

      this.drawTape(ctx, tape, bitSize, i * bitSize);
    }
  }
}

exports.Turing = Turing;

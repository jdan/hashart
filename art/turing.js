const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Turing extends Art {
  constructor() {
    super({
      init: 2,
      seed: 3,
      α0: 3,
      β0: 3,
      γ0: 3,
      δ0: 3,
      α1: 3,
      β1: 3,
      γ1: 3,
      δ1: 3,
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
        α: triplet("α0"),
        β: triplet("β0"),
        γ: triplet("γ0"),
        δ: triplet("δ0"),
      },
      1: {
        α: triplet("α1"),
        β: triplet("β1"),
        γ: triplet("γ1"),
        δ: triplet("δ1"),
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

    const bitSize = _(12, w);
    let tape = Array.from({
      length: 2 * Math.floor(Math.max(w, h) / bitSize) + 2,
    }).map((_) => {
      const n = Math.sin(10000 * params.seed++);
      const rng = n - Math.floor(n);
      return Math.round(rng);
    });
    let cursorPosition = Math.floor(tape.length / 2);
    let state = "αβγδ"[Math.floor(params.init * 4)];

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

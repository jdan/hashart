const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Turing extends Art {
  constructor() {
    super({
      α0: 3,
      β0: 3,
      γ0: 3,
      α1: 3,
      β1: 3,
      γ1: 3,
      α2: 3,
      β2: 3,
      γ2: 3,
    });
    this.filename = "turing.js";
    this.created = "28 May 2021";
  }

  transitionTable(params) {
    function triplet(key) {
      return {
        write: Math.floor((params[key + "Buffer"][0] / 256) * 3),
        move: Math.floor((params[key + "Buffer"][1] / 256) * 2),
        nextState: "αβγ"[Math.floor((params[key + "Buffer"][0] / 256) * 3)],
      };
    }

    return {
      0: {
        α: triplet("α0"),
        β: triplet("β0"),
        γ: triplet("γ0"),
      },
      1: {
        α: triplet("α1"),
        β: triplet("β1"),
        γ: triplet("γ1"),
      },
      2: {
        α: triplet("α2"),
        β: triplet("β2"),
        γ: triplet("γ2"),
      },
    };
  }

  transitionTableHtml(params) {
    const table = this.transitionTable(params);
    const body = [0, 1, 2]
      .map((i) => {
        const row = "αβγ"
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
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  getDescription(params) {
    return `
      From the hash we construct a 4-state
      <a href="https://en.wikipedia.org/wiki/Turing_machine">Turing machine</a>
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
    const start = Math.floor(tape.length / 4);
    const end = Math.floor((3 / 4) * tape.length);
    for (let i = start; i < end; i++) {
      if (tape[i]) {
        const shade = (tape[i] - 1) * 128;
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;

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

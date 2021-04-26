const { Art } = require("./_base.js");
const { _ } = require("./util.js");

let ChessGame = require("chess.js");
if (ChessGame.Chess) {
  ChessGame = ChessGame.Chess;
}

class Chess extends Art {
  constructor() {
    super({
      moves: 16,
    });
    this.debounce = true;
    this.filename = "chess.js";
    this.created = "24 Apr 2021";
  }

  getDescription({ movesBuffer }) {
    return `
      We use the excellent <a href="https://github.com/jhlywa/chess.js">chess.js</a> library
      to simulate a chess game where each move is generated from the <code>moves</code> buffer. That is,
      for each byte in <code>moves</code>, we cycle through the list of <em>all</em> possible moves
      and choose the one at the index specified by the byte (modulo the length of the list of moves).

      Even though each player only plays 8 moves, they're probably not very good moves so
      you're likely to generate a never-seen-before game.

      If you'd like to analyze or continue the game above, you can do so by heading to
      <a href="https://lichess.org/paste">lichess.org/paste</a> and entering the following PGN:

      <strong>${this.getPgn(movesBuffer)}</strong>
    `;
  }

  getPgn(movesBuffer) {
    return this.getGame(movesBuffer).pgn({ newline_char: "<br/>" });
  }

  getGame(movesBuffer) {
    const game = new ChessGame();

    for (let i = 0; i < movesBuffer.byteLength; i++) {
      let moves = game.moves();
      game.move(moves[Math.floor((movesBuffer[i] / 256) * moves.length)]);
    }

    return game;
  }

  squareToAscii(square) {
    return square
      ? {
          k: "♔♚",
          q: "♕♛",
          r: "♖♜",
          b: "♗♝",
          n: "♘♞",
          p: "♙♟",
        }[square.type][square.color === "w" ? 0 : 1]
      : "";
  }

  draw(ctx, { movesBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const game = this.getGame(movesBuffer);

    const squareSize = _(140, Math.min(w, h));
    ctx.font = `${squareSize}px monospace`;
    ctx.fillStyle = "rgb(0, 0, 0)";

    const leftPadding = w / 2 - (8 * squareSize) / 2;
    const topPadding = h / 2 - (8 * squareSize) / 2;

    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const x = leftPadding + c * squareSize;
        const y = topPadding + r * squareSize;

        if (r % 2 !== c % 2) {
          ctx.fillStyle = "rgb(180, 180, 180)";
          ctx.fillRect(x, y, squareSize, squareSize);
        }

        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.textAlign = "center";
        ctx.fillText(
          this.squareToAscii(board[r][c]),
          x + squareSize / 2,
          y + squareSize - _(18, Math.min(w, h))
        );
      }
    }
  }
}

exports.Chess = Chess;

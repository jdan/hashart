const { Art } = require("./_base.js");

class Fifteen extends Art {
  constructor() {
    super({
      moves: 32,
    });
    this.filename = "fifteen.js";
    this.created = "21 Feb 2022";
  }

  getDescription() {
    return `
      Begin with the initial <a href="https://en.wikipedia.org/wiki/15_puzzle">15 puzzle</a>,
      where numbers are arranged in a 4x4 grid starting at 1 and increasing to 15.
      The last square is left empty.

      For each of the bytes in <code>moves</code>, split into four 2-bit pairs
      and use each of them to encode a single "move" N/E/S/W.

      For each individual "move," go to the empty space and attempt to grab the
      tile in the N/E/S/W direction. If there is no tile there (such as, if we are
      along an edge), skip the move.

      After each valid move, draw the current grid on the canvas. Use "black" for
      the empty square, and increase the lightness for each tile (tile 15 being white).
    `;
  }

  getEmptyPosition(grid) {
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        if (grid[y][x] === 0) {
          return { x, y };
        }
      }
    }
  }

  computeIdealLayout(w, h, grids) {
    const idealNegativeSpace = (w * h) / 4;
    let bestLayout = { negativeSpace: 0 };

    for (let rows = 1; rows < grids.length; rows++) {
      for (let padding = 16; padding < 100; padding += 3) {
        for (let puzzleSize = 64; puzzleSize < 200; puzzleSize += 16) {
          let columns = Math.ceil(grids.length / rows);
          let layoutWidth = columns * puzzleSize + (columns + 1) * padding;
          let layoutHeight = rows * puzzleSize + (rows + 1) * padding;

          // Doesn't fit, continue
          if (layoutWidth > w || layoutHeight > h) {
            continue;
          }

          const negativeSpace =
            // Size of the canvas
            w * h -
            // Subtract the area the layout takes up
            layoutWidth * layoutHeight +
            // We took out too much! Add back the total area of the puzzles
            puzzleSize * rows * columns;

          if (
            Math.abs(idealNegativeSpace - negativeSpace) <
            Math.abs(idealNegativeSpace - bestLayout.negativeSpace)
          ) {
            bestLayout = {
              negativeSpace,
              rows,
              columns,
              layoutWidth,
              layoutHeight,
              padding,
              puzzleSize,
            };
          }
        }
      }
    }

    return bestLayout;
  }

  drawPuzzle(ctx, x, y, puzzleSize, grid) {
    const pixelSize = puzzleSize / 4;

    grid.forEach((n, idx) => {
      // prob scale
      const gray = (n / 15) * 255;
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;

      ctx.beginPath();
      ctx.rect(
        x + pixelSize * (idx % 4),
        y + pixelSize * Math.floor(idx / 4),
        pixelSize,
        pixelSize
      );
      ctx.fill();
    });
  }

  draw(ctx, { movesBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const currentGrid = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 0],
    ];

    const grids = [[].concat.apply([], currentGrid)];

    // From each byte we get one of N/E/S/W, representing
    // the direction of the block we'll be moving
    const moves = [].concat(
      ...Array.from(movesBuffer).map((byte) => [
        byte >> 6,
        (byte >> 4) % 4,
        (byte >> 2) % 4,
        byte % 4,
      ])
    );

    moves.forEach((move) => {
      const { x, y } = this.getEmptyPosition(currentGrid);
      const tmp = currentGrid[y][x];
      let changed = false;
      if (move === 0 && y > 0) {
        currentGrid[y][x] = currentGrid[y - 1][x];
        currentGrid[y - 1][x] = tmp;
        changed = true;
      } else if (move === 1 && x < 3) {
        currentGrid[y][x] = currentGrid[y][x + 1];
        currentGrid[y][x + 1] = tmp;
        changed = true;
      } else if (move === 2 && y < 3) {
        currentGrid[y][x] = currentGrid[y + 1][x];
        currentGrid[y + 1][x] = tmp;
        changed = true;
      } else if (move === 3 && x > 0) {
        currentGrid[y][x] = currentGrid[y][x - 1];
        currentGrid[y][x - 1] = tmp;
        changed = true;
      }

      if (changed) {
        grids.push([].concat.apply([], currentGrid));
      }
    });

    const { rows, columns, layoutWidth, layoutHeight, padding, puzzleSize } =
      this.computeIdealLayout(w, h, grids);

    grids.forEach((grid, idx) => {
      const row = Math.floor(idx / columns);
      const column = idx % columns;

      const x =
        Math.floor(w / 2 - layoutWidth / 2) +
        column * puzzleSize +
        padding * (column + 1);
      const y =
        Math.floor(h / 2 - layoutHeight / 2) +
        row * puzzleSize +
        padding * (row + 1);

      this.drawPuzzle(ctx, x, y, puzzleSize, grid);
    });
  }
}

exports.Fifteen = Fifteen;

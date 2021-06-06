/**
 * Chess game finder
 *
 * Usage:
 *    $ node scripts/chess.js "1. d4 d5 2. c4" jdan
 *    Using 3 bytes to find 1. d4 d5 2. c4
 *    Found! jdan1574
 *
 * https://hash.jordanscales.com/chess/jdan1574 will have the opening "1. d4 d5 2. c4"
 */
const crypto = require("crypto");
const { getPgn } = require("../art/chess.js");

function pgnOfSeed(str, bytes) {
  const shaSum = crypto.createHash("sha256");
  shaSum.update(str);
  const buffer = shaSum.digest();
  return getPgn(buffer.slice(0, bytes));
}

let prefix = process.argv[3] || "";
let i = 0;

// The art takes 16 bytes from the buffer, but let's only
// take the number of bytes we need to speed up the pgn calcuation
let requiredBytes = process.argv[2].replace(/\d+\.\s/g, "").split(" ").length;
console.log(`Using ${requiredBytes} bytes to find ${process.argv[2]}`);

while (!pgnOfSeed(prefix + i, requiredBytes).startsWith(process.argv[2])) {
  i++;
}

console.log("Found!", prefix + i);

/**
 * Numerator minimizer
 *
 * Usage:
 *    $ node scripts/numerator.js jdan
 *    ...
 *    jdan136845 12092n
 *    ...
 *
 * https://hash.jordanscales.com/fraction/jdan136845 will have a numerator of "12092"
 */
const crypto = require("crypto");
const { bigIntOfBuffer } = require("../art/fraction.js");

function numeratorOfSeed(str) {
  const shaSum = crypto.createHash("sha256");
  shaSum.update(str);
  const buffer = shaSum.digest();
  const a = bigIntOfBuffer(Array.from(buffer.slice(0, 4)));
  const b = bigIntOfBuffer(Array.from(buffer.slice(4, 8)));

  return a < b ? a : b;
}

let prefix = process.argv[2] || "";
let i = 0;
let minNumerator = Infinity;
while (minNumerator) {
  const numer = numeratorOfSeed(prefix + i);
  if (numer < minNumerator) {
    console.log(prefix + i, numer);
    minNumerator = numer;
  }

  i++;
}

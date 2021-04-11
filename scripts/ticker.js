/**
 * Ticker finder
 *
 * Usage:
 *    $ node scripts/ticker.js JDAN cool
 *    Found! cool728113
 *
 * https://hash.jordanscales.com/stocks/cool728113 will have the ticket "JDAN"
 */
const crypto = require("crypto");

function tickerOfSeed(str) {
  const shaSum = crypto.createHash("sha256");
  shaSum.update(str);
  const buffer = shaSum.digest();
  const name = Array.from(buffer.slice(0, 4));
  return name.map((v) => String.fromCharCode((v % 26) + 65)).join("");
}

let prefix = process.argv[3] || "";
let i = 0;
while (tickerOfSeed(prefix + i) !== process.argv[2]) {
  i++;
}

console.log("Found!", prefix + i);

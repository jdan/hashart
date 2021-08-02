/**
 * Element name finder
 *
 * Usage:
 *    $ node scripts/find-element.js Ph jdan
 *    seed: jdan52 = Phodinium
 *
 * https://hash.jordanscales.com/element/jdan52 will have the name "Phondinium"
 */
const crypto = require("crypto");
const { getName } = require("../art/element.js");

function nameOfSeed(str) {
  const shaSum = crypto.createHash("sha256");
  shaSum.update(str);
  const buffer = shaSum.digest();
  return getName(buffer.slice(0, 12));
}

let prefix = process.argv[3] || "";
let i = 0;

// TODO: Test if the markov chain even contains the target string
while (!nameOfSeed(prefix + i).startsWith(process.argv[2])) {
  i++;
}

console.log(`seed: ${prefix + i} = ${nameOfSeed(prefix + i)}`);

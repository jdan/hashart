exports._ = (measurement, dimension) =>
  // Map from [0, 1320] to [0, dimension]
  //
  // Useful when we know a width of "200" looks good at 1320px and
  // want to scale it.
  Math.round((measurement * dimension) / 1320);

exports.project = (val, valMin, valMax, desiredMin, desiredMax) =>
  ((val - valMin) / (valMax - valMin)) * (desiredMax - desiredMin) + desiredMin;

exports.bigIntOfBuffer = (buffer) => {
  let res = 0n;
  buffer.forEach((item, idx) => {
    res *= 256n;
    res += BigInt(item);
  });
  return res;
};

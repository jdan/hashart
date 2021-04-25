exports._ = (measurement, dimension) =>
  // Map from [0, 1320] to [0, dimension]
  //
  // Useful when we know a width of "200" looks good at 1320px and
  // want to scale it.
  Math.round((measurement * dimension) / 1320);

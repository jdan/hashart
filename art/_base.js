class Art {
  constructor(template) {
    if (!template) {
      throw "input template must be used";
    }
    this.template = template;
  }

  description(buffer) {
    let obj = {};
    let idx = 0;

    for (let [name, bytes] of Object.entries(this.template)) {
      const slice = buffer.slice(idx, idx + bytes);
      obj[name + "Buffer"] = slice;
      obj[name] = this.normalize(slice);

      idx += bytes;
    }

    return this.getDescription(obj);
  }

  getDescription() {
    return null;
  }

  templateEntries() {
    let usedBytes = Object.values(this.template).reduce((a, b) => a + b, 0);
    return Object.entries(this.template).concat(
      usedBytes < 32 ? [["unused", 32 - usedBytes]] : []
    );
  }

  explanation(buff) {
    let buffer = new Uint8Array(buff);
    let idx = 0;
    let segments = [];

    for (let [name, bytes] of this.templateEntries()) {
      let slice = buffer.slice(idx, idx + bytes);
      segments.push({
        name,
        bytes: Array.prototype.map
          .call(slice, (x) => ("00" + x.toString(16)).slice(-2))
          .join(""),
        normalized: this.normalize(slice),
      });

      idx += bytes;
    }

    return segments;
  }

  normalize(buffer) {
    if (buffer.byteLength === 0) {
      return 0;
    } else {
      return buffer[0] / 0x100 + this.normalize(buffer.slice(1)) / 0x100;
    }
  }

  render(ctx, buffer, props) {
    let idx = 0;
    let obj = {};

    for (let [name, bytes] of Object.entries(this.template)) {
      const slice = buffer.slice(idx, idx + bytes);
      obj[name + "Buffer"] = slice;
      obj[name] = this.normalize(slice);

      idx += bytes;
    }

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.draw(ctx, obj, props);
    ctx.restore();
  }

  draw() {
    throw "Child class must implement draw()";
  }
}

exports.Art = Art;

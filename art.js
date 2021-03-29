class Art {
  constructor(template) {
    if (!template) {
      throw "input template must be used";
    }
    this.template = template;
  }

  templateEntries() {
    let usedBytes = Object.values(this.template).reduce((a, b) => a + b, 0);
    return Object.entries(this.template).concat([["unused", 32 - usedBytes]]);
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
    }

    return segments;
  }

  str2ab(text) {
    return new TextEncoder().encode(text);
  }

  normalize(buffer) {
    if (buffer.byteLength === 0) {
      return 0;
    } else {
      return buffer[0] / 0x100 + this.normalize(buffer.slice(1)) / 0x100;
    }
  }

  render(ctx, buffer) {
    let idx = 0;
    let obj = {};

    for (let [name, bytes] of Object.entries(this.template)) {
      const slice = buffer.slice(idx, idx + bytes);
      obj[name + "Buffer"] = slice;
      obj[name] = this.normalize(slice);

      idx += bytes;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.draw(ctx, obj);
  }

  draw() {
    throw "draw() not implemented";
  }
}

export class Circle extends Art {
  constructor() {
    super({
      x1: 2,
      y1: 2,
      r1: 2,
      // prettier-ignore
      "θ1": 1,
      d1: 1,

      x2: 2,
      y2: 2,
      r2: 2,
      // prettier-ignore
      "θ2": 1,
      d2: 1,
    });
  }

  shadedCircle(ctx, { style, x, y, r, theta, d }) {
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();

    // only shade for small enough distances
    if (d < 20) {
      for (let myd = r - d; myd > -r; myd -= d) {
        let mytheta = Math.acos(myd / r);
        ctx.beginPath();
        ctx.moveTo(
          x + r * Math.cos(mytheta + theta),
          y + r * Math.sin(mytheta + theta)
        );
        ctx.lineTo(
          x + r * Math.cos(-mytheta + theta),
          y + r * Math.sin(-mytheta + theta)
        );
        ctx.stroke();
      }
    }
  }

  draw(ctx, { x1, y1, r1, d1, x2, y2, r2, d2, ...obj }) {
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.shadedCircle(ctx, {
      style: "rgb(100, 100, 100)",
      x: x1 * ctx.canvas.width,
      y: y1 * ctx.canvas.height,
      r: r1 * ctx.canvas.width,
      theta: obj["θ1"] * Math.PI,
      d: d1 * 100,
    });

    this.shadedCircle(ctx, {
      style: "rgb(51, 51, 51)",
      x: x2 * ctx.canvas.width,
      y: y2 * ctx.canvas.height,
      r: r2 * ctx.canvas.width,
      theta: obj["θ2"] * Math.PI,
      d: d2 * 200,
    });
  }
}

// const $canvas = document.getElementById("canvas");
// const ctx = $canvas.getContext("2d");
// const c = new Circle(ctx);

// c.render("two circles one canvas");

// document.getElementById("edit-link").addEventListener("click", (e) => {
//   e.preventDefault();
//   c.render(prompt("Enter a seed"));
// });

class Art {
  constructor(ctx, template) {
    this.ctx = ctx;
    if (!template) {
      throw "input template must be used";
    }
    this.template = template;
  }

  templateEntries() {
    let usedBytes = Object.values(this.template).reduce((a, b) => a + b, 0);
    return Object.entries(this.template).concat([["unused", 32 - usedBytes]]);
  }

  renderSeed($el, seed) {
    $el.innerText = seed;
  }

  renderExplanation($el, buff) {
    let buffer = new Uint8Array(buff);
    let idx = 0;
    let $container = document.createElement("div");
    $container.className = "explanation";

    for (let [name, bytes] of this.templateEntries()) {
      let $segment = document.createElement("div");
      $segment.className = "segment";
      let slice = buffer.slice(idx, idx + bytes);

      $segment.setAttribute("title", this.normalize(slice));

      let sectionBytes = Array.prototype.map
        .call(slice, (x) => ("00" + x.toString(16)).slice(-2))
        .join("");

      if (name === "unused") {
        $segment.classList.add("unused");
      }

      let $bytes = document.createElement("div");
      $bytes.className = "segment-bytes";
      $bytes.innerText = sectionBytes;

      let $name = document.createElement("div");
      $name.className = "segment-name";
      $name.innerText = name;

      $segment.appendChild($name);
      $segment.appendChild($bytes);
      $container.appendChild($segment);
      idx += bytes;
    }

    $el.innerHTML = "";
    $el.appendChild($container);
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

  render(text) {
    return crypto.subtle.digest("SHA-256", this.str2ab(text)).then((buff) => {
      c.renderSeed(document.getElementById("seed-value"), text);
      c.renderExplanation(document.getElementById("hash"), buff);

      let buffer = new Uint8Array(buff);
      let idx = 0;
      let obj = {};

      for (let [name, bytes] of Object.entries(this.template)) {
        const slice = buffer.slice(idx, idx + bytes);
        obj[name + "Buffer"] = slice;
        obj[name] = this.normalize(slice);

        idx += bytes;
      }

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.draw(obj);
    });
  }

  draw() {
    throw "draw() not implemented";
  }
}

class Circle extends Art {
  constructor(ctx) {
    super(ctx, {
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

  shadedCircle({ style, x, y, r, theta, d }) {
    this.ctx.strokeStyle = style;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.stroke();

    // only shade for small enough distances
    if (d < 20) {
      for (let myd = r - d; myd > -r; myd -= d) {
        let mytheta = Math.acos(myd / r);
        this.ctx.beginPath();
        this.ctx.moveTo(
          x + r * Math.cos(mytheta + theta),
          y + r * Math.sin(mytheta + theta)
        );
        this.ctx.lineTo(
          x + r * Math.cos(-mytheta + theta),
          y + r * Math.sin(-mytheta + theta)
        );
        this.ctx.stroke();
      }
    }
  }

  draw({ x1, y1, r1, d1, x2, y2, r2, d2, ...obj }) {
    this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.shadedCircle({
      style: "rgb(100, 100, 100)",
      x: x1 * ctx.canvas.width,
      y: y1 * ctx.canvas.height,
      r: r1 * ctx.canvas.width,
      theta: obj["θ1"] * Math.PI,
      d: d1 * 100,
    });

    this.shadedCircle({
      style: "rgb(51, 51, 51)",
      x: x2 * ctx.canvas.width,
      y: y2 * ctx.canvas.height,
      r: r2 * ctx.canvas.width,
      theta: obj["θ2"] * Math.PI,
      d: d2 * 200,
    });
  }
}

const $canvas = document.getElementById("canvas");
const ctx = $canvas.getContext("2d");
const c = new Circle(ctx);

c.render("two circles one canvas");

document.getElementById("edit-link").addEventListener("click", (e) => {
  e.preventDefault();
  c.render(prompt("Enter a seed"));
});

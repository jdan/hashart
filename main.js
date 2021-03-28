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
      r1: 4,

      x2: 2,
      y2: 2,
      r2: 4,
    });
  }

  draw({ x1, y1, r1, x2, y2, r2 }) {
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.arc(
      x1 * ctx.canvas.width,
      y1 * ctx.canvas.height,
      r1 * ctx.canvas.width,
      0,
      2 * Math.PI
    );
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.arc(
      x2 * ctx.canvas.width,
      y2 * ctx.canvas.height,
      r2 * ctx.canvas.width,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }
}

const $canvas = document.getElementById("canvas");
const ctx = $canvas.getContext("2d");
const c = new Circle(ctx);

c.render("two circles one canvas");

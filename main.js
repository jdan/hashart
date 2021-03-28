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

  renderExplanation($el, buff) {
    let buffer = new Uint8Array(buff);
    let idx = 0;
    let $container = document.createElement("div");
    $container.className = "explanation";

    for (let [name, bytes] of this.templateEntries()) {
      let $segment = document.createElement("div");
      $segment.className = "segment";
      let sectionBytes = Array.prototype.map
        .call(buffer.slice(idx, idx + bytes), (x) =>
          ("00" + x.toString(16)).slice(-2)
        )
        .join("");

      let $bytes = document.createElement("div");
      $bytes.className = "segment-bytes";
      $bytes.innerText = sectionBytes;

      let $name = document.createElement("div");
      $name.className = "segment-name";
      $name.innerText = name;

      $segment.appendChild($bytes);
      $segment.appendChild($name);
      $container.appendChild($segment);
      idx += bytes;
    }

    $el.innerHTML = "";
    $el.appendChild($container);
  }

  render(buff) {
    let buffer = new Uint8Array(buff);
    let idx = 0;
    let obj = {};

    for (let [name, bytes] of Object.entries(this.template)) {
      obj[name] = buffer.slice(idx, idx + bytes);
      // TODO: obj[name + 'Normalized'] = ...

      idx += bytes;
    }

    this.draw(obj);
  }

  draw() {
    throw "draw() not implemented";
  }
}

function str2ab(text) {
  return new TextEncoder().encode(text);
}

class Circle extends Art {
  constructor(ctx) {
    super(ctx, {
      pos: 2,
      radius: 5,
    });
  }

  draw({ pos, radius }) {
    console.log("pos", pos);
    console.log("radius", radius);
  }
}

const $canvas = document.getElementById("canvas");
const ctx = $canvas.getContext("2d");
const c = new Circle(ctx);

crypto.subtle.digest("SHA-256", str2ab("Hello, world!")).then((buffer) => {
  c.renderExplanation(document.getElementById("hash"), buffer);
  c.render(buffer);
});

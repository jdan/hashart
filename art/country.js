const { Art } = require("./_base.js");
const { _, project } = require("./util.js");
const { chain, countries } = require("./country-markov.js");

function titleCase(name) {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildName(buffer, offset) {
  let currentNode = "start";
  let result = "";

  for (let i = 0; i < buffer.length; i++) {
    const options = chain[currentNode];
    if (!options || options.length === 0) {
      break;
    }

    const byte = buffer[(i + offset) % buffer.length] ^ ((offset * 53) % 256);
    const next = options[Math.floor((byte / 256) * options.length)];
    if (next === "end") {
      break;
    }

    if (result === "") {
      result = next;
    } else {
      result += next[next.length - 1];
    }
    currentNode = next;
  }

  return titleCase(result).replace(/\bAnd\b/g, "and").replace(/\bOf\b/g, "of");
}

function getName(buffer) {
  const realNames = new Set(countries.map((country) => country.toLowerCase()));

  for (let offset = 0; offset < 8; offset++) {
    const name = buildName(buffer, offset);
    if (name.length >= 4 && !realNames.has(name.toLowerCase())) {
      return name;
    }
  }

  return buildName(buffer, 0) || countries[buffer[0] % countries.length];
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(ctx, x, y, outer, inner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const theta = -Math.PI / 2 + (i * Math.PI) / points;
    const px = x + radius * Math.cos(theta);
    const py = y + radius * Math.sin(theta);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

class Country extends Art {
  constructor() {
    super({
      traverse: 24,
      palette: 3,
      layout: 1,
      emblem: 2,
      stats: 2,
    });
    this.filename = "country.js";
    this.created = "12 Jul 2026";
  }

  getDescription() {
    return `
      Begin with a <a href="https://en.wikipedia.org/wiki/Markov_chain">Markov chain</a> built using
      trigrams from the Unicode emoji flag names. For example, a country name like
      <code>Canada</code> contributes <code>START → can → ana → nad → ada → END</code>.

      Traverse the graph by picking the next trigram using the <code>traverse</code> buffer.
      The generated place may resemble an existing country or territory, because the chain is trained
      on the 259 Unicode <code>RGI_Emoji_Flag_Sequence</code> names.

      The rest of the hash chooses a grayscale flag palette, layout, emblem, and a few fake almanac details.
    `;
  }

  drawFlag(ctx, x, y, width, height, { paletteBuffer, layout, emblemBuffer }) {
    const base = Math.floor(project(paletteBuffer[0], 0, 255, 96, 178));
    const offsetA = Math.floor(project(paletteBuffer[1], 0, 255, 28, 58));
    const offsetB = Math.floor(project(paletteBuffer[2], 0, 255, 34, 72));
    const colors = [
      `rgb(${base}, ${base}, ${base})`,
      `rgb(${Math.min(238, base + offsetA)}, ${Math.min(238, base + offsetA)}, ${Math.min(238, base + offsetA)})`,
      `rgb(${Math.max(42, base - offsetB)}, ${Math.max(42, base - offsetB)}, ${Math.max(42, base - offsetB)})`,
      "white",
    ];

    ctx.save();
    roundedRect(ctx, x, y, width, height, _(28, ctx.canvas.width));
    ctx.clip();

    ctx.fillStyle = "white";
    ctx.fillRect(x, y, width, height);

    const mode = Math.floor(layout * 6);
    const stripe = height / 6;
    ctx.lineCap = "butt";

    if (mode === 0) {
      ctx.fillStyle = colors[1];
      ctx.fillRect(x, y + height / 3, width, height / 3);
      ctx.strokeStyle = colors[2];
      ctx.lineWidth = _(8, ctx.canvas.width);
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + (height * i) / 3);
        ctx.lineTo(x + width, y + (height * i) / 3);
        ctx.stroke();
      }
    } else if (mode === 1) {
      ctx.fillStyle = colors[1];
      ctx.fillRect(x + width / 3, y, width / 3, height);
      ctx.strokeStyle = colors[2];
      ctx.lineWidth = _(8, ctx.canvas.width);
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (width * i) / 3, y);
        ctx.lineTo(x + (width * i) / 3, y + height);
        ctx.stroke();
      }
    } else if (mode === 2) {
      ctx.strokeStyle = colors[2];
      ctx.lineWidth = height * 0.16;
      ctx.beginPath();
      ctx.moveTo(x, y + height / 2);
      ctx.lineTo(x + width, y + height / 2);
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width / 2, y + height);
      ctx.stroke();
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = height * 0.055;
      ctx.beginPath();
      ctx.moveTo(x, y + height / 2);
      ctx.lineTo(x + width, y + height / 2);
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width / 2, y + height);
      ctx.stroke();
    } else if (mode === 3) {
      ctx.strokeStyle = colors[1];
      ctx.lineWidth = _(34, ctx.canvas.width);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y + height);
      ctx.moveTo(x + width, y);
      ctx.lineTo(x, y + height);
      ctx.stroke();
      ctx.strokeStyle = colors[2];
      ctx.lineWidth = _(10, ctx.canvas.width);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y + height);
      ctx.moveTo(x + width, y);
      ctx.lineTo(x, y + height);
      ctx.stroke();
    } else if (mode === 4) {
      ctx.strokeStyle = colors[2];
      ctx.lineWidth = _(9, ctx.canvas.width);
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + stripe * i);
        ctx.lineTo(x + width, y + stripe * i);
        ctx.stroke();
      }
      ctx.fillStyle = colors[1];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width * 0.34, y + height / 2);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = colors[2];
      ctx.lineWidth = _(10, ctx.canvas.width);
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, height * 0.28, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = _(5, ctx.canvas.width);
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, height * 0.18, 0, 2 * Math.PI);
      ctx.stroke();
    }

    ctx.strokeStyle = colors[2];
    ctx.fillStyle = "white";
    ctx.lineWidth = _(7, ctx.canvas.width);
    const emblem = emblemBuffer[0] % 3;
    const ex = x + width * project(emblemBuffer[1], 0, 255, 0.25, 0.75);
    const ey = y + height * project(emblemBuffer[0], 0, 255, 0.28, 0.72);
    if (emblem === 0) {
      drawStar(ctx, ex, ey, _(44, ctx.canvas.width), _(18, ctx.canvas.width), 5 + (emblemBuffer[1] % 3));
      ctx.stroke();
    } else if (emblem === 1) {
      ctx.beginPath();
      ctx.arc(ex, ey, _(42, ctx.canvas.width), 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(ex - _(58, ctx.canvas.width), ey);
      ctx.lineTo(ex + _(58, ctx.canvas.width), ey);
      ctx.moveTo(ex, ey - _(58, ctx.canvas.width));
      ctx.lineTo(ex, ey + _(58, ctx.canvas.width));
      ctx.stroke();
    }

    ctx.restore();
    ctx.lineWidth = _(6, ctx.canvas.width);
    ctx.strokeStyle = "black";
    roundedRect(ctx, x, y, width, height, _(28, ctx.canvas.width));
    ctx.stroke();
  }

  draw(ctx, { traverseBuffer, paletteBuffer, layout, emblemBuffer, statsBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const name = getName(traverseBuffer);

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "black";
    ctx.font = `bold ${_(98, h)}px Arial`;
    const words = name.split(" ");
    const lines = name.length > 18 && words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [name];
    const titleTop = 185;
    const titleLineHeight = 110;
    const titleBottom = titleTop + (lines.length - 1) * titleLineHeight;
    const flagGap = 160;
    const flagTop = _(titleBottom + flagGap, h);
    const flagHeight = _(600, h);
    lines.forEach((line, i) => ctx.fillText(line, _(105, w), _(titleTop + i * titleLineHeight, h)));

    this.drawFlag(ctx, _(105, w), flagTop, _(900, w), flagHeight, {
      paletteBuffer,
      layout,
      emblemBuffer,
    });

    const population = (0.2 + (statsBuffer[0] / 255) * 98).toFixed(1);
    const area = Math.floor(500 + (statsBuffer[1] / 255) * 2400000).toLocaleString();
    const code = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
    const statsTop = flagTop + flagHeight + _(flagGap, h);

    ctx.font = `bold ${_(42, h)}px Arial`;
    ctx.fillText(`CODE ${code}`, _(105, w), statsTop);
    ctx.fillText(`POP. ${population}M`, _(470, w), statsTop);
    ctx.fillText(`AREA ${area} KM²`, _(780, w), statsTop);

  }
}

exports.Country = Country;
exports.getName = getName;

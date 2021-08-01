const { Art } = require("./_base.js");
const { _ } = require("./util.js");
const { chain, elements } = require("./element-markov.js");

class Element extends Art {
  constructor() {
    super({
      traverse: 16,
      protons: 2,
      weight: 2,
      rotations: 8,
    });
    this.filename = "element.js";
    this.created = "01 Aug 2021";
  }

  getDescription() {
    return `
      Begin with a <a href="https://en.wikipedia.org/wiki/Markov_chain">Markov chain</a> built using the
      bigrams of the chemical elements (up to Oganesson (Og, 118) as of 1 Aug 2021). For example,
      the element oxygen forms the chain <code>START -> ox -> xy -> yg -> ge -> en -> END</code>.

      Combine <a href="https://github.com/jdan/hashart/blob/main/art/element-markov.js#L12">these chains</a>
      (things get interesting when one bigram can go in many directions such as
      <a href="https://github.com/jdan/hashart/blob/main/art/element-markov.js#L172">"li"</a>)
      and traverse the graph by picking the next node in the graph using the <code>traverse</code> buffer.
      Continue until END to get the name of your element, which may be the name of an existing element.

      This markov chain was generated with <a href="https://github.com/jdan/markov.rb#how-it-works">markov.rb</a>
      and converted to JSON.

      The atomic number of our new element is computed by multiplying the <code>protons</code> vector by 300.
      The atomic weight is computed using <code>atomicNumber * (1.5 + weight)</code>.

      From the atomic number, draw electrons according to the
      <a href="https://en.wikipedia.org/wiki/Bohr_model">Bohr model</a>, where each ring can hold <code>2n²</code>
      electrons. Rotate each ring according to the nth byte in the <code>rotations</code> buffer.
    `;
  }

  getName(buffer) {
    let currentNode = "start";
    let result = "";

    for (let i = 0; i < buffer.length; i++) {
      let options = chain[currentNode];
      let nonterminatingOptions = options.filter((o) => o !== "end");

      let next = options[Math.floor((buffer[i] / 256) * options.length)];

      if (next === "end") {
        break;
      }

      currentNode = next;
      if (result === "") {
        result = currentNode;
      } else {
        result += currentNode[currentNode.length - 1];
      }
    }

    return result[0].toUpperCase() + result.slice(1);
  }

  getAtomicNumber(protons) {
    // return Math.floor(119 + protons * 100);
    return Math.floor(protons * 300);
  }

  draw(ctx, { traverseBuffer, protons, weight, rotationsBuffer }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const name = this.getName(traverseBuffer);
    const left = 100;

    let atomicNumber = this.getAtomicNumber(protons);
    ctx.font = `bold ${_(100, w)}px Arial`;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(atomicNumber, _(left, w), _(180, w));

    ctx.font = `bold ${_(180, w)}px Arial`;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(name.slice(0, 2), _(left - 8, w), _(h - 280, w));

    ctx.font = `bold ${_(60, w)}px Arial`;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(name, _(left, w), _(h - 190, w));

    let atomicWeight = atomicNumber * (1.5 + weight);
    ctx.font = `bold ${_(60, w)}px Arial`;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(atomicWeight.toFixed(2), _(left, w), _(h - 105, w));

    const bohrCenterX = _(830, w);
    const bohrCenterY = h / 2;
    // (w * 7) / 24 - nice outer width
    const innerRadius = _(45, w);

    ctx.lineWidth = _(2, w);
    ctx.beginPath();
    ctx.arc(bohrCenterX, bohrCenterY, innerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    let shells = [];
    for (let i = 1; atomicNumber > 0; i++) {
      let electrons = Math.min(2 * i * i, atomicNumber);
      atomicNumber -= electrons;
      shells.push(electrons);
    }

    const electronRadius = 6;
    ctx.fillStyle = "rgb(255, 255, 255)";
    shells.forEach((electrons, i) => {
      const radius = innerRadius * (i + 2);
      ctx.beginPath();
      ctx.arc(bohrCenterX, bohrCenterY, radius, 0, 2 * Math.PI);
      ctx.stroke();

      for (let n = 0; n < electrons; n++) {
        const theta =
          (2 * Math.PI * n) / electrons +
          (rotationsBuffer[i] / 256) * 2 * Math.PI;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = _(5, w);
        ctx.arc(
          bohrCenterX + radius * Math.cos(theta),
          bohrCenterY + radius * Math.sin(theta),
          _(electronRadius, w),
          0,
          2 * Math.PI
        );
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
    });
  }
}

exports.Element = Element;

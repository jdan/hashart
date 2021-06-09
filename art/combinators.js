const { Art } = require("./_base.js");
const { _ } = require("./util.js");

class Combinators extends Art {
  constructor() {
    super({
      branches: 32,
    });
    this.created = "06 Jun 2021";
    this.filename = "combinators.js";
    this.hidden = true;
  }

  nthDepthFirst(tree, n) {
    function leaves(tree) {
      if (tree.value) {
        return [tree];
      } else {
        return leaves(tree.left).concat(leaves(tree.right));
      }
    }

    const ls = leaves(tree);
    return ls[n % ls.length];
  }

  getValues(byte) {
    const choices = "SKI";
    return [
      choices[(17 * byte) % choices.length],
      choices[(23 * byte) % choices.length],
    ];
  }

  fork(leaf, byte) {
    delete leaf.value;
    let [left, right] = this.getValues(byte);
    leaf.left = {
      value: left,
    };
    leaf.right = {
      value: right,
    };
  }

  treeToString(tree) {
    if (tree.value) {
      return tree.value;
    } else {
      return (
        "(" + this.treeToString(tree.left) + this.treeToString(tree.right) + ")"
      );
    }
  }

  draw(ctx, { branchesBuffer }) {
    let tree = {
      value: "I",
    };
    branchesBuffer.forEach((byte) => {
      let node = this.nthDepthFirst(tree, byte);
      this.fork(node, byte);
    });
    console.log(this.treeToString(tree));
  }
}

exports.Combinators = Combinators;

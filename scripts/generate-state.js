/**
 * Using vendor/rom.nes, generates a snapshot of the game after a series
 * of preliminary loading screens and button presses
 */

const fs = require("fs");
const path = require("path");
const jsnes = require("jsnes");

const VENDOR_PATH = path.join(__dirname, "../vendor");
const ROM_PATH = path.join(VENDOR_PATH, "rom.nes");
const STATE_PATH = path.join(VENDOR_PATH, "state.json");

// Copied from art.js
function buttonPress(nes, button, holdFrames = 1) {
  nes.buttonDown(1, button);
  for (let i = 0; i < holdFrames; i++) {
    nes.frame();
  }
  nes.buttonUp(1, button);
  nes.frame();
}

module.exports = () => {
  if (!fs.existsSync(ROM_PATH)) {
    console.log("vendor/rom.nes not found, skipping state generation...");
    return;
  } else if (fs.existsSync(STATE_PATH)) {
    return fs.readFileSync(STATE_PATH, "utf-8");
  }

  const nes = new jsnes.NES();
  const romData = fs.readFileSync(ROM_PATH, { encoding: "binary" });

  nes.loadROM(romData);

  const BUTTON_START = 3;
  const BUTTON_RIGHT = 7;

  // Wait 137 frames for the menu to load
  for (let i = 0; i < 137; i++) {
    nes.frame();
  }
  buttonPress(nes, BUTTON_START);

  // Wait 31 games for the first game to load
  for (let i = 0; i < 31; i++) {
    nes.frame();
  }

  buttonPress(nes, BUTTON_START);

  // Wait 162 frames for level 1-1 to start
  for (let i = 0; i < 162; i++) {
    nes.frame();
  }

  // Walk right for 30 frames
  buttonPress(nes, BUTTON_RIGHT, 30);

  // Wait 30 frames for the walking animation to stop
  for (let i = 0; i < 30; i++) {
    nes.frame();
  }

  const state = JSON.stringify(nes.toJSON());
  fs.writeFileSync(STATE_PATH, state);
  return state;
};

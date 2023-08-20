import { TextStyle } from "pixi.js";
import { Sound } from "@pixi/sound";
import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";

const TILESIZE = 36;
const STARTING_PIECES = 3;
const REROLL_BUDGET = 4;
const FAIL_TOLERANCE = 6;
const palette = { bg: 0x1d2018, fg: 0xdde8ee };
const SOUNDS = {
  piece_pick: Sound.from("./audio/piece_pick.wav"),
  piece_drop: Sound.from("./audio/piece_drop.wav"),
  piece_put: Sound.from("./audio/piece_put.wav"),
  piece_delete: Sound.from("./audio/piece_delete.wav"),
  reroll: Sound.from("./audio/reroll.wav"),
  reroll_fail: Sound.from("./audio/reroll_fail.wav"),
};
const FONT_STYLE = new TextStyle({
  fill: palette.fg,
  fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
  fontWeight: "bold",
  align: "center",
  wordWrap: true,
  wordWrapWidth: 400,
});
const BULB_GLOW = new AdvancedBloomFilter({
  bloomScale: 0.6,
  brightness: 1,
  blur: 1.5,
});
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export {
  TILESIZE,
  STARTING_PIECES,
  REROLL_BUDGET,
  FAIL_TOLERANCE,
  BULB_GLOW,
  FONT_STYLE,
  SOUNDS,
  palette,
  randInt,
};

import { AnimatedSprite, Texture, Resource } from "pixi.js";
import { HexagonalPosition, toXY } from "./hexagon";
import { TILESIZE, palette, BULB_GLOW } from "../globalConfig";

class Bulb extends AnimatedSprite {
  check: HexagonalPosition;
  cell: HexagonalPosition;
  target: boolean[] = [true, Math.random() > 0.5];

  constructor(
    frames: Texture<Resource>[],
    check: HexagonalPosition,
    cell: HexagonalPosition
  ) {
    super(frames);
    this.anchor.set(0.5);
    this.x = toXY(cell).x * TILESIZE;
    this.y = toXY(cell).y * TILESIZE;
    this.tint = palette.fg;
    this.check = check;
    this.cell = cell;
  }

  toggle(isOn: boolean) {
    if (isOn) {
      this.gotoAndStop(1);
      this.filters = [BULB_GLOW];
    } else {
      this.gotoAndStop(0);
      this.filters = [];
    }
  }
}
export { Bulb };

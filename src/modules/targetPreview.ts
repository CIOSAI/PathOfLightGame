import { Container, Sprite } from "pixi.js";
import { HexagonalPosition, add, toXY, fromTU } from "./hexagon";
import { TILESIZE } from "../globalConfig";

class TargetPreview extends Container {
  constructor() {
    super();
    this.scale.set(0.7);
  }

  killChildren() {
    this.removeChildren();
  }

  updatePreview(
    isOn: boolean,
    cell: HexagonalPosition,
    check: HexagonalPosition
  ) {
    const preview = Sprite.from(
      isOn ? "./sprites/bulb_on.png" : "./sprites/bulb_off.png"
    );
    let direction = add(cell, fromTU(-check.t, -check.u));
    preview.x = toXY(direction).x * TILESIZE;
    preview.y = toXY(direction).y * TILESIZE;
    this.addChild(preview);
  }
}
export { TargetPreview };

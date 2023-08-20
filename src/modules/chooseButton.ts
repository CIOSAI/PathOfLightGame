import { Sprite, Container } from "pixi.js";
import { palette } from "../globalConfig";

class ChooseButton extends Container {
  constructor(img: Sprite, onClick: () => void) {
    super();

    img.anchor.set(0.5);
    img.tint = palette.fg;
    this.addChild(img);

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerdown", onClick);
  }
}

export { ChooseButton };

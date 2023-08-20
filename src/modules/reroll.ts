import { Container, Sprite, Text } from "pixi.js";
import { FONT_STYLE, REROLL_BUDGET, palette } from "../globalConfig";

class Reroller extends Container {
  budget: number;
  text: Text;
  constructor(onReroll: () => void) {
    super();

    this.budget = REROLL_BUDGET;

    this.text = new Text(`${this.budget}`, FONT_STYLE);
    this.text.anchor.x = 0.5;
    this.text.anchor.y = 1;
    this.text.x = -24;
    this.text.y = -64;
    this.text.alpha = 0;

    const rerollButton = Sprite.from("./sprites/reroll_button.png");
    rerollButton.anchor.set(1);
    rerollButton.tint = palette.fg;
    rerollButton.eventMode = "static";
    rerollButton.cursor = "pointer";
    rerollButton.on("pointerenter", () => {
      rerollButton.rotation = Math.PI / 18;
      this.text.alpha = 1;
    });
    rerollButton.on("pointerleave", () => {
      rerollButton.rotation = 0;
      this.text.alpha = 0;
    });
    rerollButton.on("pointerdown", onReroll);

    this.addChild(this.text);
    this.addChild(rerollButton);
  }

  countDown() {
    this.budget -= 1;
    this.text.text = `${this.budget}`;
  }

  refresh() {
    this.budget = REROLL_BUDGET;
    this.text.text = `${this.budget}`;
  }
}

export { Reroller };

import { Sprite, Container } from "pixi.js";
import { HexagonalPosition, toXY, equals } from "./hexagon";
import { TILESIZE, palette } from "../globalConfig";

const TILE_TEXTURES = [
  "sprites/blank.png",
  "sprites/nonconductive.png",
  "sprites/conductive.png",
  "sprites/powersource.png",
];
enum TILES {
  BLANK,
  NONCONDUCTIVE,
  CONDUCTIVE,
  POWERSOURCE,
  UNUSED,
}

class TileMap extends Container {
  points: Map<HexagonalPosition, TILES>;

  constructor() {
    super();
    this.points = new Map();
  }

  set(hp: HexagonalPosition, tile: TILES) {
    this.points.set(hp, tile);
    this.update();
  }

  get(hp: HexagonalPosition): TILES {
    for (let [key, value] of this.points) {
      if (equals(key, hp)) {
        return value;
      }
    }
    return this.points.get(hp) ?? TILES.UNUSED;
  }

  remove(hp: HexagonalPosition) {
    for (let [key, value] of this.points) {
      if (equals(key, hp)) {
        this.points.delete(key);
      }
    }
  }

  update() {
    this.points.forEach((val, key) => {
      const tile = Sprite.from(TILE_TEXTURES[val]);
      tile.anchor.set(0.5);
      tile.tint = palette.fg;
      tile.x = toXY(key).x * TILESIZE;
      tile.y = toXY(key).y * TILESIZE;

      this.addChild(tile);
    });
  }
}

export { TileMap, TILES };

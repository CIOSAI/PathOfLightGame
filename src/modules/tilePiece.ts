import { randInt } from "../globalConfig";
import { TileMap, TILES } from "./tilemap";
import { fromTU, fromSU, HP_ZERO, add } from "./hexagon";

class TilePiece extends TileMap {
  static TILE_AMOUNT = 3;
  static NEIGHBORS = [
    fromTU(1, 0),
    fromTU(-1, 0),
    fromTU(0, 1),
    fromTU(0, -1),
    fromSU(1, 0),
    fromSU(-1, 0),
  ];

  static randTile(): TILES {
    return Math.random() > 0.5 ? TILES.CONDUCTIVE : TILES.NONCONDUCTIVE;
  }

  constructor() {
    super();
    this.set(HP_ZERO, TILES.CONDUCTIVE);

    let randHp = () => {
      let tiles = [];
      for (let t = -2; t <= 2; t++) {
        for (let u = -2; u <= 2; u++) {
          if (Math.abs(t + u) >= 3) continue;
          if (this.get(fromTU(t, u)) != TILES.UNUSED) continue;
          if (
            TilePiece.NEIGHBORS.every(
              (hp) =>
                [TILES.CONDUCTIVE, TILES.NONCONDUCTIVE].indexOf(
                  this.get(add(fromTU(t, u), hp))
                ) == -1
            )
          )
            continue;
          tiles.push(fromTU(t, u));
        }
      }
      return tiles[Math.floor(Math.random() * tiles.length)];
    };

    for (let i = 0; i < randInt(2, TilePiece.TILE_AMOUNT) - 1; i++) {
      this.set(randHp(), TilePiece.randTile());
    }

    this.eventMode = "static";
    this.cursor = "pointer";
  }
}

export { TilePiece };

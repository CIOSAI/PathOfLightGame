import {
  Application,
  Container,
  FederatedPointerEvent,
  Point,
  Sprite,
  Text,
  Texture,
  Graphics,
} from "pixi.js";
import {
  HexagonalPosition,
  fromTU,
  fromSU,
  fromXY,
  HP_ZERO,
  add,
  equals,
  toXY,
} from "./modules/hexagon";
import { TileMap, TILES } from "./modules/tilemap";
import { TilePiece } from "./modules/tilePiece";
import { Reroller } from "./modules/reroll";
import { GameState, StateRoot } from "./modules/stateMachine";
import {
  STARTING_PIECES,
  TILESIZE,
  palette,
  SOUNDS,
  FONT_STYLE,
  FAIL_TOLERANCE,
} from "./globalConfig";
import { TargetPreview } from "./modules/targetPreview";
import { ChooseButton } from "./modules/chooseButton";
import { Bulb } from "./modules/Bulb";

const app = new Application({
  view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  backgroundColor: palette.bg,
  width: 480,
  height: 480,
});

app.stage.eventMode = "static";
app.stage.hitArea = app.screen;

let onRestart: Array<() => void> = [];

document.addEventListener("keyup", (e) => {
  if (e.key == "r") {
    switch (stateRoot.current) {
      case STATES.over:
        for (let proc of onRestart) {
          proc();
        }
        break;
      default:
        stateRoot.changeTo(STATES.over);
    }
  }
});

interface MyGameState extends GameState {
  onPiecePicked: (p: TilePiece) => void;
  onMouseEntered: (p: TilePiece) => void;
  onMouseExited: (p: TilePiece) => void;
  onPieceDropped: (e: FederatedPointerEvent) => void;
}

const tm = new TileMap();
tm.x = app.screen.width / 2;
tm.y = app.screen.height * 0.4;
for (let t = -2; t <= 2; t++) {
  for (let u = -2; u <= 2; u++) {
    if (Math.abs(t + u) >= 3) continue;
    if (equals(HP_ZERO, fromTU(t, u))) continue;
    tm.set(fromTU(t, u), TILES.BLANK);
  }
}
tm.set(HP_ZERO, TILES.POWERSOURCE);
app.stage.addChild(tm);

// --- RESTART ---
let overlay = new TileMap();
overlay.position.copyFrom(tm.position);
onRestart.push(() => {
  overlay.destroy();
  overlay = new TileMap();
  overlay.position.copyFrom(tm.position);
});

class HitPoints extends Graphics {
  constructor() {
    super();
  }
  updateHitPoints(high: number) {
    this.clear();
    this.beginFill(palette.fg);
    for (let i = 0; i < high; i++) {
      this.drawCircle(0, -18 * i, 6);
    }
    this.endFill();
  }
}

const hitPoints = new HitPoints();
hitPoints.visible = false;
hitPoints.x = app.screen.width * 0.05;
hitPoints.y = app.screen.height * 0.95;
app.stage.addChild(hitPoints);
hitPoints.updateHitPoints(FAIL_TOLERANCE);

onRestart.push(() => {
  hitPoints.visible = false;
  hitPoints.updateHitPoints(FAIL_TOLERANCE);
});

class TargetPreviewContainer extends Container {
  static STEP = 96;

  registered: TargetPreview[] = [];

  constructor() {
    super();
  }

  register(tp: TargetPreview) {
    this.registered.push(tp);
  }
}

const targetPreviews = new TargetPreviewContainer();
targetPreviews.x = app.screen.width * 0.1;
targetPreviews.y = app.screen.height * 0.4;
targetPreviews.visible = false;
app.stage.addChild(targetPreviews);

onRestart.push(() => {
  targetPreviews.visible = false;
  targetPreviews.removeChildren();
  targetPreviews.registered = [];
});

// --- RESTART ---

const bulbContainer = new Container();
bulbContainer.position.copyFrom(tm.position);

// --- RESTART ---
bulbContainer.visible = false;
onRestart.push(() => {
  bulbContainer.visible = false;
});
// --- RESTART ---

let bulbs: Map<HexagonalPosition, Bulb> = new Map();

// --- RESTART ---

function bulbSetUp() {
  for (let i of [
    { check: fromTU(-2, 0), cell: fromTU(-3, 0) },
    { check: fromTU(0, 2), cell: fromTU(0, 3) },
    { check: fromSU(2, 0), cell: fromSU(3, 0) },
  ]) {
    if (Array.from(bulbs.keys()).some((j) => equals(j, i.cell))) {
      const elwey = bulbs.get(
        Array.from(bulbs.keys()).filter((j) => equals(j, i.cell))[0]
      );
      if (elwey) {
        elwey.toggle(false);
        elwey.target = [true, Math.random() > 0.5];
      }
    } else {
      const bulb = new Bulb(
        [
          Texture.from("./sprites/bulb_off.png"),
          Texture.from("./sprites/bulb_on.png"),
        ],
        i.check,
        i.cell
      );
      bulbs.set(i.cell, bulb);
    }
  }

  for (let [key, val] of bulbs) {
    bulbContainer.addChild(val);
  }
}
bulbSetUp();
onRestart.push(() => {
  bulbContainer.removeChildren();
  bulbSetUp();
});

app.stage.addChild(bulbContainer);
// --- RESTART ---

function updateBulbs() {
  let powered: HexagonalPosition[] = [];
  let toPush = [HP_ZERO];

  while (toPush.length != 0) {
    powered = [...powered, ...toPush];
    toPush = [];
    for (let cell of powered) {
      for (let hp of TilePiece.NEIGHBORS) {
        let boardPos = add(cell, hp);
        if (overlay.get(boardPos) != TILES.CONDUCTIVE) continue;
        if (toPush.some((check) => equals(check, boardPos))) continue;
        if (powered.some((check) => equals(check, boardPos))) continue;
        toPush.push(boardPos);
      }
    }
  }

  for (let [key, val] of bulbs) {
    val.toggle(false);
    if (powered.some((i) => equals(i, val.check))) {
      val.toggle(true);
    }
  }

  let goalReached = Array.from(bulbs.values()).every((i) => {
    return i.target[0] == (i.currentFrame == 1);
  });

  if (goalReached) {
    if (!targetPreviews.visible) {
      hintText.text = "Match the pattern on the left side";
      targetPreviews.visible = true;
    }

    gameData.confsCompleted += 1;
    gameData.fails = 0;
    hitPoints.updateHitPoints(FAIL_TOLERANCE);

    let sameCount = 3;
    bulbs.forEach((val, key) => {
      let previous = val.target.splice(0, 1)[0];
      let desiredCurrent = Math.random() > 0.5;
      if (previous != desiredCurrent) sameCount -= 1;

      val.target.push(sameCount != 3 ? desiredCurrent : !desiredCurrent);
    });
  } else {
    if (gameData.piecesPut < STARTING_PIECES) return;
    gameData.fails += 1;
    hitPoints.updateHitPoints(FAIL_TOLERANCE - gameData.fails);
    if (gameData.fails >= FAIL_TOLERANCE) {
      stateRoot.changeTo(STATES.over);
    }
  }
}

// --- RESTART ---
function createTargetPreview() {
  for (let i = 0; i < 2; i++) {
    const tp = new TargetPreview();
    tp.y = -i * TargetPreviewContainer.STEP;

    for (let [key, val] of bulbs) {
      tp.updatePreview(val.target[i], val.cell, val.check);
    }

    targetPreviews.register(tp);
    targetPreviews.addChild(tp);
  }
}
createTargetPreview();
onRestart.push(() => {
  createTargetPreview();
});

app.ticker.add((delta) => {
  for (let i = 0; i < targetPreviews.registered.length; i++) {
    targetPreviews.registered[i].killChildren();
    for (let [key, val] of bulbs) {
      targetPreviews.registered[i].updatePreview(
        val.target[i],
        val.cell,
        val.check
      );
    }
  }
});

const mask = Sprite.from("./sprites/todelete_mask.png");
const maskScrollRate = 36;
mask.alpha = 0;
app.stage.addChild(mask);
app.ticker.add((delta) => {
  mask.position.set(mask.x + (maskScrollRate * delta) / 60);
  if (mask.x > 20) mask.position.set(mask.x - 20);
});

const reroller = new Reroller(() => {
  if (reroller.budget > 0) {
    piece.destroy();
    piece = createPiece();
    reroller.countDown();
    SOUNDS.reroll.play();
  } else {
    SOUNDS.reroll_fail.play();
  }
});
reroller.x = app.screen.width * 0.9;
reroller.y = app.screen.height * 0.9;

// --- RESTART ---
reroller.visible = false;
app.stage.addChild(reroller);
onRestart.push(() => {
  reroller.visible = false;
});

const chooser = new Container();
chooser.x = app.screen.width * 0.5;
chooser.y = app.screen.width * 0.8;
chooser.visible = false;
const addPieceButton = new ChooseButton(
  Sprite.from("./sprites/put_button.png"),
  () => {
    stateRoot.changeTo(STATES.put);
  }
);
addPieceButton.x = app.screen.width * -0.2;
const deletePieceButton = new ChooseButton(
  Sprite.from("./sprites/delete_button.png"),
  () => {
    stateRoot.changeTo(STATES.delete);
  }
);
deletePieceButton.x = app.screen.width * 0.2;
chooser.addChild(addPieceButton);
chooser.addChild(deletePieceButton);
app.stage.addChild(chooser);

const hintText = new Text("", FONT_STYLE);
hintText.anchor.set(0.5);
hintText.x = app.screen.width * 0.5;
hintText.y = app.screen.height * 0.1;
app.stage.addChild(hintText);

const gameData = {
  piecesPut: 0,
  fails: 0,
  confsCompleted: 0,
};

let toMove: any = undefined;

onRestart.push(() => {
  hintText.text = "";
  gameData.piecesPut = 0;
  gameData.fails = 0;
  gameData.confsCompleted = 0;
  toMove = undefined;
});

let piece: TilePiece;
const pieceOrigin = new Point(app.screen.width * 0.5, app.screen.height * 0.8);

app.stage.addEventListener("pointermove", (e) => {
  if (!toMove) return;
  toMove.position.copyFrom(e.global);
});
// --- RESTART ---

function createPiece() {
  const instance = new TilePiece();
  instance.position.copyFrom(pieceOrigin);
  instance.on("pointerdown", () => {
    stateRoot.current.onPiecePicked(instance);
  });
  instance.on("pointerenter", () => {
    stateRoot.current.onMouseEntered(instance);
  });
  instance.on("pointerleave", () => {
    stateRoot.current.onMouseExited(instance);
  });
  app.stage.addChild(instance);
  overlay.on("destroyed", () => {
    if (instance) {
      instance.destroy();
    }
  });
  return instance;
}

app.stage.addEventListener("pointerup", (e) => {
  if (!piece) return;
  stateRoot.current.onPieceDropped(e);
});

const gameOver = new Graphics();
gameOver.visible = false;

const gameOverText = new Text("GAME OVER", FONT_STYLE);
gameOverText.anchor.x = 0.5;
gameOverText.anchor.y = 0.2;
gameOverText.x = app.screen.width * 0.5;
gameOverText.y = app.screen.height * 0.05;
gameOver.addChild(gameOverText);

const scoreText = new Text("", FONT_STYLE);
scoreText.anchor.set(0.5);
scoreText.x = app.screen.width * 0.5;
scoreText.y = app.screen.height * 0.7;
gameOver.addChild(scoreText);

const restartHint = new Text("Press R to restart", FONT_STYLE);
restartHint.anchor.set(0.5);
restartHint.x = app.screen.width * 0.5;
restartHint.y = app.screen.height * 0.9;
gameOver.addChild(restartHint);

app.stage.addChild(gameOver);

const STATES: {
  put: MyGameState;
  choose: MyGameState;
  delete: MyGameState;
  over: MyGameState;
} = {
  put: {
    onEnter: () => {
      piece = createPiece();
      switch (gameData.piecesPut) {
        case 0:
          hintText.text = "Put the block on to the board";
          break;
        case 1:
          hintText.text = "Reroll if you don't like the block";
          reroller.visible = true;
          reroller.refresh();
          break;
        case 2:
          bulbContainer.visible = true;
          hintText.text = "Power the bulbs";
          reroller.visible = true;
          reroller.refresh();
          break;
        case 3:
          hitPoints.visible = true;
          hintText.text = "Bottom right shows how many turns you have left";
          reroller.visible = true;
          reroller.refresh();
          break;
        case 4:
          hintText.text = "Press R on the keyboard to give up";
          reroller.visible = true;
          reroller.refresh();
          break;
        default:
          reroller.visible = true;
          reroller.refresh();
      }
    },
    onExit: () => {
      reroller.visible = false;
    },
    onPiecePicked: (p) => {
      if (p != piece) return;
      toMove = p;
      SOUNDS.piece_pick.play();
    },
    onMouseEntered: () => {},
    onMouseExited: () => {},
    onPieceDropped: (e) => {
      if (tm.getBounds().contains(e.global.x, e.global.y) && toMove) {
        let { x: x, y: y } = tm.toLocal(e.global);
        let offset = fromXY(x / TILESIZE, y / TILESIZE);
        offset.t = Math.round(offset.t);
        offset.u = Math.round(offset.u);

        let points = toMove.points as Map<HexagonalPosition, TILES>;
        let isLegal = Array.from(points.keys()).every((cell) => {
          if (tm.get(add(offset, cell)) != TILES.BLANK) return false;
          if (overlay.get(add(offset, cell)) != TILES.UNUSED) return false;
          return true;
        });
        if (isLegal) {
          points.forEach((val, key) => {
            overlay.set(add(offset, key), val);
          });
          piece.position.copyFrom(
            tm.toGlobal(
              new Point(toXY(offset).x * TILESIZE, toXY(offset).y * TILESIZE)
            )
          );

          SOUNDS.piece_put.play();

          gameData.piecesPut += 1;

          if (gameData.piecesPut < STARTING_PIECES) {
            stateRoot.changeTo(STATES.put);
          } else {
            stateRoot.changeTo(STATES.choose);
          }
          updateBulbs();
        } else {
          piece.position.copyFrom(pieceOrigin);
          SOUNDS.piece_drop.play();
        }
      } else {
        piece.position.copyFrom(pieceOrigin);
      }
      toMove = undefined;
    },
  },
  choose: {
    onEnter: () => {
      chooser.visible = true;
    },
    onExit: () => {
      chooser.visible = false;
    },
    onPiecePicked: () => {},
    onPieceDropped: () => {},
    onMouseEntered: () => {},
    onMouseExited: () => {},
  },
  delete: {
    onEnter: () => {},
    onExit: () => {},
    onPiecePicked: (p) => {
      let offset = fromXY((p.x - tm.x) / TILESIZE, (p.y - tm.y) / TILESIZE);
      offset.t = Math.round(offset.t);
      offset.u = Math.round(offset.u);

      p.points.forEach((val, key) => {
        overlay.remove(add(offset, key));
      });

      SOUNDS.piece_delete.play();

      p.destroy();
      mask.alpha = 0;

      stateRoot.changeTo(STATES.choose);
      updateBulbs();
    },
    onMouseEntered: (p) => {
      p.mask = mask;
      mask.alpha = 1;
    },
    onMouseExited: (p) => {
      p.mask = null;
      mask.alpha = 0;
    },
    onPieceDropped: (e) => {},
  },
  over: {
    onEnter: () => {
      console.log("over entered");

      scoreText.text = `Completed: ${gameData.confsCompleted}\nTotal Blocks Used: ${gameData.piecesPut}`;
      gameOver.visible = true;
      piece.visible = false;
      gameOver.beginFill(palette.bg);
      gameOver.drawRect(0, 0, 480, 480);
      gameOver.endFill();
    },
    onExit: () => {
      gameOver.visible = false;
      piece.visible = true;
    },
    onPiecePicked: (p) => {},
    onMouseEntered: (p) => {},
    onMouseExited: (p) => {},
    onPieceDropped: (e) => {},
  },
};
const stateRoot = new StateRoot(STATES.put);
onRestart.push(() => {
  stateRoot.changeTo(STATES.put);
});

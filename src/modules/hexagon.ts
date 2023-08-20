interface HexagonalPosition {
  t: number;
  u: number;
}

const HP_ZERO = { t: 0, u: 0 };

function fromTU(t: number, u: number): HexagonalPosition {
  return { t: t, u: u };
}
function fromSU(s: number, u: number): HexagonalPosition {
  return { t: s, u: u - s };
}
function fromST(s: number, t: number): HexagonalPosition {
  return { t: t + s, u: -s };
}
function moveS(hp: HexagonalPosition, s: number): HexagonalPosition {
  return { t: hp.t + s, u: hp.u - s };
}
function moveT(hp: HexagonalPosition, t: number): HexagonalPosition {
  return { t: hp.t + t, u: hp.u };
}
function moveU(hp: HexagonalPosition, u: number): HexagonalPosition {
  return { t: hp.t, u: hp.u + u };
}
function add(a: HexagonalPosition, b: HexagonalPosition): HexagonalPosition {
  return { t: a.t + b.t, u: a.u + b.u };
}
function equals(a: HexagonalPosition, b: HexagonalPosition): boolean {
  return a.t === b.t && a.u === b.u;
}
function toXY(hp: HexagonalPosition) {
  return { x: hp.t * (Math.sqrt(3) / 2), y: hp.u + hp.t / 2 };
}
function fromXY(x: number, y: number): HexagonalPosition {
  return { t: x / (Math.sqrt(3) / 2), u: y - x / 2 };
}

export {
  HexagonalPosition,
  HP_ZERO,
  fromTU,
  fromSU,
  fromST,
  moveS,
  moveT,
  moveU,
  add,
  equals,
  toXY,
  fromXY,
};

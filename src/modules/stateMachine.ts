interface GameState {
  onEnter: () => void;
  onExit: () => void;
}

class StateRoot<T extends GameState> {
  current: T;
  constructor(def: T) {
    this.current = def;
    this.current.onEnter();
  }
  changeTo(target: T) {
    this.current.onExit();
    this.current = target;
    target.onEnter();
  }
}

export { GameState, StateRoot };

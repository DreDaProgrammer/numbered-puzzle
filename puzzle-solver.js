// puzzle-solver.js

/**
 * Solves a 4×4 sliding puzzle (15-puzzle) using A* with Manhattan distance.
 * @param {number[]} startState - Array of length 16 containing values 0–15 (0 = blank).
 * @returns {string[]|null} Array of moves ("up","down","left","right") to solve, or null if unsolvable.
 */
export function solvePuzzle(startState) {
  const gridSize = 4;
  const goalState = [...Array(gridSize * gridSize - 1).keys()]
    .map((n) => n + 1)
    .concat(0);
  const startKey = stateToString(startState);
  const goalKey = stateToString(goalState);

  // Manhattan distance heuristic
  function heuristic(state) {
    let dist = 0;
    for (let i = 0; i < state.length; i++) {
      const v = state[i];
      if (v === 0) continue;
      const goalRow = Math.floor((v - 1) / gridSize);
      const goalCol = (v - 1) % gridSize;
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      dist += Math.abs(row - goalRow) + Math.abs(col - goalCol);
    }
    return dist;
  }

  // Serialize state for use as Map/Set keys
  function stateToString(state) {
    return state.join(",");
  }

  // Generate neighbor states with move labels
  function getNeighbors(state) {
    const neighbors = [];
    const idx0 = state.indexOf(0);
    const row0 = Math.floor(idx0 / gridSize);
    const col0 = idx0 % gridSize;

    const tryMove = (dr, dc, move) => {
      const newRow = row0 + dr;
      const newCol = col0 + dc;
      if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize)
        return;
      const idx1 = newRow * gridSize + newCol;
      const newState = state.slice();
      // swap blank and neighbor
      [newState[idx0], newState[idx1]] = [newState[idx1], newState[idx0]];
      neighbors.push({ state: newState, move });
    };

    tryMove(-1, 0, "up");
    tryMove(1, 0, "down");
    tryMove(0, -1, "left");
    tryMove(0, 1, "right");

    return neighbors;
  }

  // Min-heap priority queue on fScore
  class MinHeap {
    constructor() {
      this.data = [];
    }
    push(node) {
      this.data.push(node);
      this._bubbleUp(this.data.length - 1);
    }
    pop() {
      if (this.data.length === 0) return null;
      const top = this.data[0];
      const end = this.data.pop();
      if (this.data.length > 0) {
        this.data[0] = end;
        this._bubbleDown(0);
      }
      return top;
    }
    isEmpty() {
      return this.data.length === 0;
    }
    _bubbleUp(i) {
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.data[i].f < this.data[p].f) {
          [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
          i = p;
        } else break;
      }
    }
    _bubbleDown(i) {
      const n = this.data.length;
      while (true) {
        let smallest = i;
        const l = 2 * i + 1,
          r = 2 * i + 2;
        if (l < n && this.data[l].f < this.data[smallest].f) smallest = l;
        if (r < n && this.data[r].f < this.data[smallest].f) smallest = r;
        if (smallest !== i) {
          [this.data[i], this.data[smallest]] = [
            this.data[smallest],
            this.data[i],
          ];
          i = smallest;
        } else break;
      }
    }
  }

  const openHeap = new MinHeap();
  const cameFrom = new Map(); // stateKey -> { prevKey, move }
  const gScore = new Map(); // stateKey -> cost
  const fScore = new Map(); // stateKey -> g + h
  const closed = new Set();

  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(startState));
  openHeap.push({ state: startState, f: fScore.get(startKey) });

  while (!openHeap.isEmpty()) {
    const node = openHeap.pop();
    const current = node.state;
    const currKey = stateToString(current);

    if (closed.has(currKey)) continue;
    if (currKey === goalKey) {
      // reconstruct path
      const path = [];
      let key = goalKey;
      while (key !== startKey) {
        const { prevKey, move } = cameFrom.get(key);
        path.push(move);
        key = prevKey;
      }
      return path.reverse();
    }

    closed.add(currKey);

    const currG = gScore.get(currKey);
    for (const { state: neighbor, move } of getNeighbors(current)) {
      const nKey = stateToString(neighbor);
      if (closed.has(nKey)) continue;

      const tentativeG = currG + 1;
      const prevG = gScore.get(nKey);
      if (prevG === undefined || tentativeG < prevG) {
        cameFrom.set(nKey, { prevKey: currKey, move });
        gScore.set(nKey, tentativeG);
        const h = heuristic(neighbor);
        fScore.set(nKey, tentativeG + h);
        openHeap.push({ state: neighbor, f: tentativeG + h });
      }
    }
  }

  // no solution found
  return null;
}

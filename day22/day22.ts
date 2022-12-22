#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/22

import { _ } from "../deps.ts";
import { Coord, Grid } from "../grid.ts";
import { assert, chunkLines, readLinesFromArgs, safeParseInt } from "../util.ts";

// Stolen from y2018day13
type Dir = 'up' | 'left' | 'down' | 'right';
const dirs: Record<Dir, [number, number]> = {
  'up': [0, -1],
  'left': [-1, 0],
  'down': [0, 1],
  'right': [1, 0],
};
const clockwise: Record<Dir, Dir> = {
  'up': 'right',
  'right': 'down',
  'down': 'left',
  'left': 'up',
};
const ccw = _.invert(clockwise) as Record<Dir, Dir>;
const sym: Record<Dir, string> = {
  'up': '^',
  'left': '<',
  'right': '>',
  'down': 'v',
};

// Facing is 0 for right (>), 1 for down (v), 2 for left (<), and 3 for up (^)
const dirValues: Record<Dir, number> = {
  'right': 0,
  'down': 1,
  'left': 2,
  'up': 3,
};
const transposeDir: Record<Dir, Dir> = {
  'right': 'down',
  'down': 'right',
  'left': 'up',
  'up': 'left',
};

interface State {
  pos: Coord;
  facing: Dir;
}

const sampleTransitions = {
  '1L': [2, 'L', 'flip'],
  '1U': [3, 'L', 'L=T'],
  '1D': [6, 'B', 'flip'],
  '2U': [6, 'R', 'L=B'],
  '2L': [1, 'L', 'flip'],
  '2R': [5, 'R', 'flip'],
  '3L': [1, 'T', 'B=R'],
  '3R': [5, 'T', 'B=L'],
  '4D': [6, 'L', 'L=B'],
  '5U': [3, 'R', 'L=B'],
  '5R': [2, 'R', 'flip'],
  '6L': [4, 'B', 'B=L'],
  '6R': [2, 'T', 'B=L'],
  '6D': [1, 'B', 'flip'],
};

const sampleFaces = [
  null,
  {x: [0, 4-1], y: [2*4, 3*4-1]},
  {x: [4, 2*4-1], y: [0, 4-1]},
  {x: [4, 2*4-1], y: [4, 2*4-1]},
  {x: [4, 2*4-1], y: [2*4, 3*4-1]},
  {x: [2*4, 3*4-1], y: [2*4, 3*4-1]},
  {x: [2*4, 3*4-1], y: [3*4, 4*4-1]},
];
const inputFaces = [
  null,
  {x: [50, 2*50-1], y: [0, 50-1]},
  {x: [2*50, 3*50-1], y: [0, 50-1]},
  {x: [50, 2*50-1], y: [50, 2*50-1]},
  {x: [0, 50-1], y: [2*50, 3*50-1]},
  {x: [50, 2*50-1], y: [2*50, 3*50-1]},
  {x: [0, 50-1], y: [3*50, 4*50-1]},
];

function transitionSample(state: State): State {
  const c = state.pos;
  const dir = state.facing;
  const face = findFace(c, 4);
  const d = dir === 'left' ? 'L' : dir === 'right' ? 'R' : dir === 'up' ? 'U' : 'D';
  const code = (sampleTransitions as any)[`${face}${d}`];
  assert(code, `face: ${face} dir: ${dir} missing`);
  const [newFace, newSide, action] = code as [number, 'L' | 'R' | 'B' | 'T', 'flip' | 'L=T' | 'L=B' | 'B=L' | 'B=R'];

  const fxy = sampleFaces[face]!;
  const nfxy = sampleFaces[newFace]!;
  const [x, y] = c;
  const fx = x - fxy.x[0];
  const fy = y - fxy.y[0];
  let nx, ny;
  if (newSide === 'L' || newSide === 'R') {
    nx = newSide === 'L' ? nfxy.x[0] : nfxy.x[1];
    if (action === 'flip') {
      ny = nfxy.y[1] - fy;
    } else if (action === 'L=T') {
      ny = nfxy.y[0] + fx;
    } else if (action === 'L=B') {
      ny = nfxy.y[1] - fx;
    } else {
      throw new Error('surprise action ' + action);
    }
  } else if (newSide === 'T' || newSide === 'B') {
    ny = newSide === 'T' ? nfxy.y[0] : nfxy.y[1];
    if (action === 'flip') {
      nx = nfxy.x[1] - fx;
    } else if (action === 'B=R') {
      nx = nfxy.x[0] + fy;
    } else if (action === 'B=L') {
      nx = nfxy.x[1] - fy;
    } else {
      throw new Error('surprise action ' + action);
    }
  } else {
    throw new Error('bad side ' + newSide);
  }

  const facing: Dir = newSide === 'L' ? 'right' : newSide === 'R' ? 'left' : newSide === 'T' ? 'down' : 'up';
  return {
    pos: [nx, ny],
    facing,
  };
}

function findEdges(g: Grid<string>) {
  const xs: {[y: string]: [number, number]} = {};
  const ys: {[x: string]: [number, number]} = {};
  for (const [[x, y]] of g) {
    const sx = String(x);
    const sy = String(y);
    if (!(sy in xs)) {
      xs[sy] = [x, x];
    } else {
      const [xMin, xMax] = xs[sy];
      xs[sy] = [Math.min(xMin, x), Math.max(xMax, x)];
    }
    if (!(sx in ys)) {
      ys[sx] = [y, y];
    } else {
      const [yMin, yMax] = ys[sx];
      ys[sx] = [Math.min(yMin, y), Math.max(yMax, y)];
    }
  }
  return {x: xs, y: ys};
}

type GridIndex = ReturnType<typeof findEdges>;

function turn(state: State, dir: 'left' | 'right'): State {
  if (dir === 'left') {
    return {pos: state.pos, facing: ccw[state.facing]};
  }
  return {pos: state.pos, facing: clockwise[state.facing]};
}

// which face are we on?
function findFace(c: Coord, n: number): 1 | 2 | 3 | 4 | 5 | 6 {
  const [x, y] = c;
  const faces = n === 4 ? sampleFaces : inputFaces;
  for (const [i, face] of faces.entries()) {
    if (!face) continue;
    const {x: [minX, maxX], y: [minY, maxY]} = face;
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      return i as 1 | 2 | 3 | 4 | 5 | 6;
    }
  }
  throw new Error(`bad face ${c}`);
}

function move1(g: Grid<string>, index: GridIndex, state: State): State | null {
  const {facing} = state;
  const [dx, dy] = dirs[facing];
  let [x, y] = state.pos;
  let c = g.get([x + dx, y + dy]);
  if (c === '.') {
    return {pos: [x + dx, y + dy], facing};
  } else if (c === '#') {
    return null;  // blocked
  } else if (c === undefined) {
    if (facing === 'up') {
      y = index.y[x][1];
    } else if (facing === 'down') {
      y = index.y[x][0];
    } else if (facing === 'left') {
      x = index.x[y][1];
    } else if (facing === 'right') {
      x = index.x[y][0];
    }
    c = g.get([x, y]);
    if (c === '.') {
      return {pos: [x, y], facing};
    } else if (c === '#') {
      return null;  // blocked
    } else {
      throw new Error(`Bad move at ${state}`);
    }
  } else {
    throw new Error(`Bad cell ${c}`);
  }
}

const path = new Grid<string>();

function action(state: State, grid: Grid<string>, index: GridIndex, move: number | 'L' | 'R'): State {
  if (move === 'L') {
    return turn(state, 'left');
  } else if (move === 'R') {
    return turn(state, 'right');
  } else {
    for (let i = 0; i < move; i++) {
      const nextState = move1(grid, index, state);
      if (nextState) {
        path.set(nextState.pos, sym[nextState.facing]);
        state = nextState;
      } else {
        return state;
      }
    }
    return state;
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [mazeStr, dirStr] = chunkLines(lines);
  let g = Grid.fromLines(mazeStr);
  const {x: [minX, maxX], y: [minY, maxY]} = g.boundingBox();
  let isTranspose = false;
  if (maxX - minX > maxY - minY) {
    isTranspose = true;
    g = g.transpose();
  }
  const dirsStr = [...dirStr[0].matchAll(/(\d+|[LR])/g)].map(([, x]) => x);
  const acts = dirsStr.map(v => v === 'L' ? (isTranspose ? 'R' : 'L') : v === 'R' ? (isTranspose ? 'L' : 'R') : safeParseInt(v));

  console.log(acts);
  console.log(g.format(v => v));

  // one direction is 4, one direction is 3.

  // box size=4x4, horizontal is the long side
  // sample: { x: [ 0, 15 ], y: [ 0, 11 ] }

  // box size=50x50, vertical is the long side
  // input: { x: [ 0, 149 ], y: [ 0, 199 ] }

  const edges = findEdges(g);

  let state: State = {
    pos: isTranspose ? [0, edges.y[0][0]] : [edges.x[0][0], 0],
    facing: isTranspose ? 'down' : 'right',
  };

  const {x: [xMin, xMax], y: [yMin, yMax]} = g.boundingBox();
  const n = (yMax - yMin + 1) / 4;
  assert(n === Math.floor(n), `${n} not an int`);
  assert ((xMax - xMin + 1) / 3 === n);
  const faces = g.mapValues((_, c) => findFace(c, n));
  console.log(faces.format(v => String(v)));

  console.log(state);
  for (const act of acts) {
    state = action(state, g, edges, act);
  }
  console.log('final state', state);

  // console.log(path.format(v => v));
  console.log(g.format((v, c) => path.get(c) ?? v));

  const row = state.pos[isTranspose ? 0 : 1] + 1;
  const col = state.pos[isTranspose ? 1 : 0] + 1;
  const facing = dirValues[isTranspose ? transposeDir[state.facing] : state.facing];

  console.log(row, col, facing);

  console.log('part 1', 1000*row + 4 * col + facing);
  console.log('part 2');
}

#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/22

import { _ } from "../deps.ts";
import { Coord, Grid } from "../grid.ts";
import { chunkLines, readLinesFromArgs, safeParseInt } from "../util.ts";

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

interface State {
  pos: Coord;
  facing: Dir;
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

function action(state: State, grid: Grid<string>, index: GridIndex, move: number | 'L' | 'R'): State {
  if (move === 'L') {
    return turn(state, 'left');
  } else if (move === 'R') {
    return turn(state, 'right');
  } else {
    for (let i = 0; i < move; i++) {
      const nextState = move1(grid, index, state);
      if (nextState) {
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
  const g = Grid.fromLines(mazeStr);
  const dirsStr = [...dirStr[0].matchAll(/(\d+|[LR])/g)].map(([, x]) => x);
  const acts = dirsStr.map(v => v === 'L' || v === 'R' ? v : safeParseInt(v));

  console.log(acts);
  console.log(g.format(v => v));
  const edges = findEdges(g);

  let state: State = {
    pos: [edges.x[0][0], 0],
    facing: 'right',
  };
  console.log(state);
  for (const act of acts) {
    console.log('performing', act);
    state = action(state, g, edges, act);
    console.log(state);
  }

  const row = state.pos[1] + 1;
  const col = state.pos[0] + 1;
  const facing = dirValues[state.facing];
  console.log('final state', row, col, facing, 1000*row + 4 * col + facing);

  console.log('part 1', lines.length);
  console.log('part 2');
}

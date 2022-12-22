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

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [mazeStr, dirStr] = chunkLines(lines);
  const g = Grid.fromLines(mazeStr);
  const dirsStr = [...dirStr[0].matchAll(/(\d+|[LR])/g)].map(([, x]) => x);
  const dirs = dirsStr.map(v => v === 'L' || v === 'R' ? v : safeParseInt(v));

  console.log(dirs);
  console.log(g.format(v => v));
  const edges = findEdges(g);
  // console.log(edges);

  console.log('part 1', lines.length);
  console.log('part 2');
}

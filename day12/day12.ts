#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/12

import { _ } from "../deps.ts";
import { bfs } from "../dijkstra.ts";
import { Coord, Grid } from "../grid.ts";
import { assert, coord2str, readLinesFromArgs, str2coord, tuple } from "../util.ts";

function readGrid(lines: readonly string[]) {
  const gS = Grid.fromLines(lines);
  let start: Coord | null = null;
  let end: Coord | null = null;
  const g = gS.mapValues((v, c) => {
    if (v === "S") {
      start = c;
      return 0;
    } else if (v === "E") {
      end = c;
      return 25;
    } else if (v >= "a" && v <= "z") {
      return v.charCodeAt(0) - "a".charCodeAt(0);
    }
    throw new Error("Surprise cell" + v);
  });
  if (!start || !end) {
    throw new Error("No start/end");
  }
  return tuple(g, start, end);
}

const dirs: Coord[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function findPath(g: Grid<number>, start: Coord, end: Coord) {
  const neighbors = function* (c: Coord) {
    const [x, y] = c;
    for (const [dx, dy] of dirs) {
      const n = tuple(x + dx, y + dy);
      const h0 = g.get(c);
      const h1 = g.get(n);
      if (h0 === undefined || h1 === undefined) {
        continue;  // off the grid
      }
      if (h1 - h0 <= 1) {  // go up at most one step, down any number.
        yield n;
      }
    }
  };

  return bfs(start, end, neighbors, coord2str, str2coord);
}

function part2(g: Grid<number>, end: Coord): number {
  let minD: number | null = null;
  for (const [c, h] of g) {
    if (h !== 0) continue;
    const p = findPath(g, c, end)!;
    if (!p) continue;
    const [d, _path] = p;
    if (d !== null && (minD === null || d < minD)) {
      minD = d;
    }
  }
  assert(minD);
  return minD;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [grid, start, end] = readGrid(lines);

  console.log(grid.format((v) => String.fromCharCode("a".charCodeAt(0) + v)));
  console.log("part 1", findPath(grid, start, end));
  console.log("part 2", part2(grid, end));
}

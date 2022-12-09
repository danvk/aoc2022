#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/9

import { _ } from "../deps.ts";
import { coord2str, readLinesFromArgs, safeParseInt, tuple, zeros } from "../util.ts";

type Point = [number, number];

const dirs: {[dir: string]: Point} = {
  L: [-1, 0],
  R: [1, 0],
  U: [0, 1],
  D: [0, -1],
};

function touching(a: Point, b: Point): boolean {
  return Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;
}

function moveTail(head: Point, tail: Point): Point {
  if (touching(head, tail)) {
    return tail;
  }
  const [hx, hy] = head;
  const [tx, ty] = tail;
  if (hx === tx) {
    for (let dy = -1; dy <= 1; dy += 2) {
      const t: Point = [tx, ty + dy];
      if (touching(head, t)) {
        return t;
      }
    }
  } else if (hy === ty) {
    for (let dx = -1; dx <= 1; dx += 2) {
      const t: Point = [tx + dx, ty];
      if (touching(head, t)) {
        return t;
      }
    }
  } else {
    for (let dx = -1; dx <= 1; dx += 2) {
      for (let dy = -1; dy <= 1; dy += 2) {
        const t: Point = [tx + dx, ty + dy];
        if (touching(head, t)) {
          return t;
        }
      }
    }
    throw new Error('no touch diag!');
  }
  throw new Error('no touch!');
}

function numTailSpots(moves: readonly [string, number][], tailLen: number): number {
  const rope: Point[] = zeros(tailLen).map(() => [0, 0]);
  const spots = new Set<string>([coord2str([0, 0])]);
  for (const [dir, num] of moves) {
    for (let i = 0; i < num; i++) {
      const [hx, hy] = rope[0];
      const [dx, dy] = dirs[dir];
      rope[0] = [hx + dx, hy + dy];
      for (let i = 1; i < tailLen; i++) {
        rope[i] = moveTail(rope[i - 1], rope[i]);
      }
      spots.add(coord2str(rope[tailLen - 1]));
    }
  }
  return spots.size;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const moves = lines.map(line => {
    const [dir, num] = line.split(' ');
    return tuple(dir, safeParseInt(num));
  });

  console.log('part 1', numTailSpots(moves, 2));
  console.log('part 2', numTailSpots(moves, 10));
}

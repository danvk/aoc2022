#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/10

import { _ } from "../../deps.ts";
import { minmax, readLinesFromArgs, safeParseInt, zeros } from "../../util.ts";

function readInts(txt: string): number[] {
  const matches = txt.matchAll(/(-?\d+)/g);
  return [...matches].map(m => safeParseInt(m[1]));
}

interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

function readPoint(txt: string): Point {
  const [x, y, dx, dy] = readInts(txt);
  return {x, y, dx, dy};
}

function maybePrintGrid(secs: number, points: readonly Point[]) {
  const [xmin, xmax] = minmax(points.map(p => p.x));
  const [ymin, ymax] = minmax(points.map(p => p.y));
  if (xmax - xmin > 100 || ymax - ymin > 100) {
    return;
  }
  console.log(secs, ':');
  const dots = _.range(ymin, ymax + 1).map(() => _.range(xmin, xmax+1).map(() => '.'));
  for (const point of points) {
    dots[point.y - ymin][point.x - xmin] = '#';
  }
  for (const row of dots) {
    console.log(row.join(''));
  }
  console.log('\n');
}

function advance(points: Point[]) {
  for (const point of points) {
    point.x += point.dx;
    point.y += point.dy;
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const points = lines.map(readPoint);
  console.log(points);
  for (let i = 0; i < 100000; i++) {
    // console.log(i, ':');
    maybePrintGrid(i, points);
    advance(points);
  }
  console.log('part 1', lines.length);
  console.log('part 2');
}

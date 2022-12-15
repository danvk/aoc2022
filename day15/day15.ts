#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/15

import { _ } from "../deps.ts";
import { Coord, Grid } from "../grid.ts";
import { assert, readInts, readLinesFromArgs, tuple } from "../util.ts";

function read(lines: string[]) {
  return lines.map(line => {
    const [sx, sy, bx, by] = readInts(line, {expect: 4});
    return {
      sensor: tuple(sx, sy),
      beacon: tuple(bx, by),
    }
  });
}

function manhattan(a: Coord, b: Coord) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const observations = read(lines);
  const g = new Grid<string>();
  for (const obs of observations) {
    g.set(obs.beacon, 'B');
    g.set(obs.sensor, 'S');
  }
  // console.log(g.format(x => x, '.'));

  const y = 2000000;
  let {x: [minX, maxX], y: [minY, maxY]} = g.boundingBox();
  for (const {sensor, beacon} of observations) {
    const d = manhattan(sensor, beacon);
    // for (let y = minY; y <= maxY; y++) {
      // if sensor.y == y, then extend d in either direction from sensor.y
      // if sensor.y == y - 1, then extend d-1 in either direction
      const span = d - Math.abs(sensor[1] - y);
      if (span > 0) {
        // if (_.isEqual(sensor, [8, 7])) {
        //   console.log(sensor, span);
        // }
        // console.log(sensor, beacon);
        // console.log(d);
        // console.log(span);
        // console.log(sensor[0] - span, sensor[0] + span);
        for (let x = sensor[0] - span; x <= sensor[0] + span; x++) {
          // const c = g.get([x, y]);
          // assert(c !== 'B', `${x}, ${y}`);
          if (g.get([x, y]) === undefined) {
            g.set([x, y], '#');
          }
        }
      }
  }

  let num = 0;
  // const y = 10;
  ({x: [minX, maxX], y: [minY, maxY]} = g.boundingBox());
  console.log(minX, maxX);
  for (let x = minX; x <= maxX; x++) {
    if (g.get([x, y]) === '#') num++;
  }

  // console.log(g.format(x => x, '.'));

  // 4287539 = wrong
  console.log('part 1', num);
  console.log('part 2');
}

#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/15

import { _ } from "../deps.ts";
import { Coord, Grid, manhattan } from "../grid.ts";
import { Interval, mergeIntIntervals, unionIntervals } from "../intervals.ts";
import { assert, readInts, readLinesFromArgs, tuple } from "../util.ts";

interface Observation {
  sensor: Coord;
  beacon: Coord;
}

function read(lines: string[]): Observation[] {
  return lines.map(line => {
    const [sx, sy, bx, by] = readInts(line, {expect: 4});
    return {
      sensor: tuple(sx, sy),
      beacon: tuple(bx, by),
    }
  });
}

function part1(g: Grid<string>, observations: Observation[]): number {
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
  for (let x = minX; x <= maxX; x++) {
    if (g.get([x, y]) === '#') num++;
  }
  return num;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const observations = read(lines);
  const g = new Grid<string>();
  // const ds = [];
  for (const obs of observations) {
    g.set(obs.beacon, 'B');
    g.set(obs.sensor, 'S');
    // const d = manhattan(obs.beacon, obs.sensor);
    // ds.push(d);
  }
  console.log('part 1', part1(g, observations));
  // console.log(ds.toSorted());
  // console.log(g.format(x => x, '.'));

  // console.log(g.format(x => x, '.'));
  // 4287539 = wrong
  // console.log('part 1', num);


  // idea: for each y-value, figure out whether we can eliminate the whole line
  // const n = 20;
  const n = 4_000_000;
  // let num = 0;
  for (let y = 0; y < n; y++) {
    // does any observation entirely eliminate this row?
    // let isEliminated = false;
    let ranges: Interval[] = [];
    for (const {sensor, beacon} of observations) {
      const d = manhattan(sensor, beacon);
      const span = d - Math.abs(sensor[1] - y);
      const x1 = sensor[0] - span;
      const x2 = sensor[0] + span;
      if (x2 >= x1) {
        const r: Interval = [x1, x2];
        ranges = unionIntervals(ranges, r);
      }
    }
    ranges = _.sortBy(ranges, r => r[0]);
    ranges = mergeIntIntervals(ranges);
    if (ranges.length === 1 && ranges[0][0] <= 0 && ranges[0][1] >= n) {
      // eliminated!
    } else {
      console.log(y, 'is a possible y');
      console.log(ranges);
      assert(ranges.length === 2);
      const x = ranges[0][1] + 1;
      console.log('part 2', x * 4000000 + y);
    }
    // console.log(y, ranges);
  }

  // console.log('part 2', num);
}

// 4000000
// x=3334479
// y=3186981

// 18598816649703 is not right.

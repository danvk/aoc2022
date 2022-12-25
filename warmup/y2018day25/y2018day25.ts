#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/25

// This was fun -- I appreciated all the test cases.
// I realized you couldn't just go point-by-point as I was writing my code,
// but fortunately the merging logic wasn't too bad. Just need to remember to
// iterate the arrays in reverse when modifying them, so that you don't change
// the remaining indices.
//
// I was #3627 overall to finish AoC 2018!

import { _ } from "../../deps.ts";
import { readInts, readLinesFromArgs } from "../../util.ts";

type Point = number[];

function d(a: Point, b: Point) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) + Math.abs(a[3] - b[3]);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const points = lines.map(line => readInts(line, {expect: 4}));

  const constellations: Point[][] = [[points[0]]];
  for (const pt of points.slice(1)) {
    const matches = [];
    for (const [i, constel] of constellations.entries()) {
      for (const other of constel) {
        if (d(pt, other) <= 3) {
          matches.push(i);
          break;
        }
      }
    }
    if (matches.length === 1) {
      constellations[matches[0]].push(pt);
    } else if (matches.length === 0) {
      constellations.push([pt]);
    } else {
      // need to merge some constellations!
      constellations[matches[matches.length - 1]].push(pt);
      for (let j = matches.length - 2; j >= 0; j--) {
        // merge j+1 into j
        const cOld = matches[j + 1];
        const cNew = matches[j];
        const [oldPoints] = constellations.splice(cOld, 1);
        constellations[cNew] = constellations[cNew].concat(oldPoints);
      }
    }
  }

  console.log(constellations.length);

  console.log('part 1', lines.length);
  console.log('part 2');
}

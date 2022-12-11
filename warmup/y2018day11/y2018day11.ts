#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/11

// Notes:
// - Introduced "zeros2d" helper
// - Turning calcPower into a lookup table was insufficient for part 2
// - Calculating just the changes as you increase square size was sufficient O(n^2) -> O(n)

import { _ } from "../../deps.ts";
import { argmax } from "../../map.ts";
import { coord2str, safeParseInt, zeros } from "../../util.ts";

export function calcPower(x: number, y: number, serial: number): number {
  const rackId = x + 10;
  let power = rackId * y;
  power += serial;
  power *= rackId;
  power = Math.floor(power / 100) % 10;
  power -= 5;
  return power;
}

function part1(serialNum: number): string {
  const m = new Map<string, number>();
  for (let x = 1; x <= 300; x++) {
    for (let y = 1; y <= 300; y++) {
      for (let s = 1; s <= 300; s++) {
        if (x + s > 300 || y + s > 300) {
          break;
        }
        let power = 0;
        for (let dx = 0; dx <= 2; dx++) {
          for (let dy = 0; dy <= 2; dy++) {
            power += calcPower(x + dx, y + dy, serialNum);
          }
        }
        m.set(coord2str([x, y]), power);
      }
    }
  }
  return argmax(m);
}

function part2(serialNum: number): string {
  let maxCoord = '';
  let maxVal = null;

  const p = zeros(300, 300);
  for (let x = 1; x <= 300; x++) {
    for (let y = 1; y <= 300; y++) {
      p[x - 1][y - 1] = calcPower(x, y, serialNum);
    }
  }

  for (let x = 1; x <= 300; x++) {
    for (let y = 1; y <= 300; y++) {
      let prevPow = 0;
      for (let s = 1; s <= 300; s++) {
        if (x + s > 300 || y + s > 300) {
          break;
        }
        let power = prevPow;
        for (let dx = 0; dx < s; dx++) {
          power += p[x + dx - 1][y + s - 1 - 1]
        }
        for (let dy = 0; dy < s - 1; dy++) {
          power += p[x + s - 1 - 1][y + dy - 1];
        }
        if (!maxVal || power > maxVal) {
          maxCoord = `${x},${y},${s}`;
          maxVal = power;
        }
        prevPow = power;
      }
    }
  }
  return maxCoord;
}

if (import.meta.main) {
  const [serialNum] = Deno.args.map(safeParseInt);
  console.log('part 1', part1(serialNum));
  console.log('part 2', part2(serialNum));
}

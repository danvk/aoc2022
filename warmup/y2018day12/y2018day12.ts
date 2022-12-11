#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/12

import { _ } from "../../deps.ts";
import { assert, minmax, readLinesFromArgs, safeParseInt } from "../../util.ts";

function read(lines: readonly string[]): [Set<number>, Map<string, boolean>] {
  const initStateStr = lines[0].split(': ')[1];
  assert(lines[1].length === 0);

  const initState = new Set<number>;
  for (let i = 0; i < initStateStr.length; i++) {
    if (initStateStr[i] === '#') {
      initState.add(i);
    }
  }

  const rules = new Map<string, boolean>();
  for (let i = 2; i < lines.length; i++) {
    const [input, result] = lines[i].split(' => ');
    rules.set(input, result === '#');
  }

  assert(!rules.get('.....'));
  return [initState, rules];
}

function advance(plants: Set<number>, rules: Map<string, boolean>) {
  const nextPlants = new Set<number>;
  const [minX, maxX] = minmax([...plants]);
  for (let x = minX - 2; x <= maxX + 2; x++) {
    const pattern = _.range(x - 2, x + 3).map(i => plants.has(i) ? '#' : '.').join('');
    if (rules.get(pattern)) {
      nextPlants.add(x);
    }
  }
  return nextPlants;
}

function part1(plants: Set<number>, rules: Map<string, boolean>, n: number): number {
  for (let i = 0; i < n; i++) {
    plants = advance(plants, rules);
  }
  const s = _.sum([...plants])
  console.log('n=', n, 'sum=', s);
  printPlants(plants);
  return s;
}

function printPlants(plants: Set<number>) {
  const [minX, maxX] = minmax([...plants]);
  console.log(_.range(minX, maxX+1).map(c => plants.has(c) ? '#' : '.').join(''));
}

function scoreAfterN(n: number) {
  const p = '##......##.............................................................##.#.#..##............##.#..##'.split('');

  const mx = n - 16;
  let score = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] === '#') {
      score += (mx + i);
    }
  }
  return score;
}

// naive approach: 23 seconds per million rounds => ~13 days
// ideas:
// - look for a pattern; does it stabilize after N rounds?
// - apply the rules to the rules to jump forward at powers of two. What's 50B in base 2?

// 5050000007936 = too high
//  750000000712 = too high
//  750000000697 = correct, but why? Off by 15. There are 15 plants.


  /*
  for (let i = 0; i < 50000000000; i++) {
    plants = advance(plants, rules);
    if (i && i % 1_000_00 === 0) {
      const [minX, maxX] = minmax([...plants]);
      console.log(i, [minX, maxX], new Date());
      console.log(_.range(minX, maxX+1).map(c => plants.has(c) ? '#' : '.').join(''));
      console.log(p.join(''));
      console.log(_.sum([...plants]));
      const mx = i - 16;
      console.log(minX, maxX, mx, mx + p.length);
      let score = 0;
      for (let i = 0; i < p.length; i++) {
        if (p[i] === '#') {
          score += (mx + i);
        }
      }
      console.log(score);
      break;
    }
  }
  return _.sum([...plants]);
  */

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [initState, rules] = read(lines);
  const n = safeParseInt(Deno.args[1]);
  console.log('part 1', part1(initState, rules, n));
  console.log('part 2', scoreAfterN(n));
}

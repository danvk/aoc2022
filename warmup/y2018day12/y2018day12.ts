#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/12

import { _ } from "../../deps.ts";
import { assert, minmax, readLinesFromArgs } from "../../util.ts";

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

function part1(plants: Set<number>, rules: Map<string, boolean>): number {
  for (let i = 0; i < 20; i++) {
    plants = advance(plants, rules);
  }
  return _.sum([...plants]);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [initState, rules] = read(lines);
  console.log('part 1', part1(initState, rules));
  console.log('part 2');
}

#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/3

import { _ } from "../deps.ts";
import { assert, intersect, readLinesFromArgs, tuple } from "../util.ts";

function readRucksack(line: string): [Set<string>, Set<string>] {
  const n = line.length;
  const [a, b] = [line.slice(0, n / 2), line.slice(n / 2)];
  console.log(a, b);
  return [new Set(a.split('')), new Set(b.split(''))];
}

function findOverlap<T>(a: Set<T>, b: Set<T>): T {
  let item: T | null = null;
  for (const x of a.keys()) {
    if (b.has(x)) {
      if (item !== null) {
        throw new Error('double overlap');
      }
      item = x;
    }
  }
  if (item === null) {
    throw new Error('no overlap');
  }
  return item;
}

function intersectThree<T>(a: Set<T>, b: Set<T>, c: Set<T>): T {
  const i1 = intersect(a, b);
  const int = intersect(c, i1);
  if (int.size !== 1) {
    throw new Error('not a unique intersection');
  }
  return [...int.keys()][0];
}

function priority(item: string): number {
  assert(item.length !== 1);
  const ascii = item.charCodeAt(0);
  const A = 'A'.charCodeAt(0);
  const a = 'a'.charCodeAt(0);
  if (ascii >= a) {
    return ascii - a + 1;
  }
  return ascii - A + 27;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const ruck = readRucksack(lines[0]);
  console.log(ruck);
  console.log(findOverlap(ruck[0], ruck[1]));
  console.log(priority('p'));

  const score = _.sum(lines.map(readRucksack).map(([a, b]) => priority(findOverlap(a, b))));

  console.log('part 1', score);

  let tally = 0;
  for (let i = 0; i < lines.length; i += 3) {
    const abc = tuple(lines[i], lines[i + 1], lines[i + 2]);
    const abcS = abc.map(line => new Set(line.split('')));
    const common = intersectThree(abcS[0], abcS[1], abcS[2]);
    const pri = priority(common);
    tally += pri;
  }

  console.log('part 2', tally);
}

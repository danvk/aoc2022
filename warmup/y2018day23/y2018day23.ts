#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/23

import { _ } from "../../deps.ts";
import { readInts, readLinesFromArgs } from "../../util.ts";

type Coord = [number, number, number];
interface Nanobot {
  pos: Coord;
  r: number;
}

function parseNanobot(line: string): Nanobot {
  const [a, b] = line.split(', ');
  const pos = readInts(a, {expect: 3}) as Coord;
  const [r] = readInts(b, {expect: 1});
  return {pos, r};
}

function distance(a: Coord, b: Coord): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const bots = lines.map(parseNanobot);
  const strongest = _.maxBy(bots, b => b.r)!;
  const inRange = bots.filter(b => distance(b.pos, strongest.pos) <= strongest.r);
  console.log('part 1', inRange.length);
  console.log('part 2');
}

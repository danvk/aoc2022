#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/5

import { _ } from "../deps.ts";
import { assert, chunkLines, readLinesFromArgs } from "../util.ts";

function parseStacks(stacks: string[]): string[][] {
  const numStacks = (stacks[0].length + 1) / 4;
  console.log(numStacks);
  const out: string[][] = _.range(0, numStacks + 1).map(() => []);
  for (const line of stacks) {
    if (!line.includes('[')) {
      break;
    }
    for (let i = 1; i < line.length; i += 4) {
      const c = line[i];
      const j = (i - 1) / 4;
      console.log(j, c);
      if (c !== ' ') {
        out[j].push(c);
      }
    }
  }
  return out;
}

interface Move {
  num: number;
  from: number;
  to: number;
}

function parseMove(move: string): Move {
  const m = move.match(/move (\d+) from (\d+) to (\d+)/);
  assert(m, move);
  const [, num, from, to] = m;
  return _.mapValues({num, from, to}, Number);
}

function applyMove(stacks: string[][], m: Move) {
  const from = m.from - 1;
  const to = m.to - 1;
  for (let i = 0; i < m.num; i++) {
    // 0 = top of stack
    assert(stacks[from].length > 0);
    const c = stacks[from].shift()!;
    stacks[to].unshift(c);
  }
}

function applyMove2(stacks: string[][], m: Move) {
  const from = m.from - 1;
  const to = m.to - 1;
  // 0 = top of stack
  const f = stacks[from];
  assert(f.length > m.num);
  const [toMove, rest] = [f.slice(0, m.num), f.slice(m.num)];
  stacks[from] = rest;
  stacks[to] = [...toMove, ...stacks[to]];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [init, movesStr] = chunkLines(lines);

  const stacks = parseStacks(init);
  console.log(stacks);

  const moves = movesStr.map(parseMove);
  const stacks2 = _.cloneDeep(stacks);
  console.log(moves);
  for (const move of moves) {
    applyMove(stacks, move);
    console.log(stacks);
  }
  console.log('part 1', stacks.map(s => s[0]).join(''));

  for (const move of moves) {
    applyMove2(stacks2, move);
    console.log(stacks2);
  }
  console.log('part 2', stacks2.map(s => s[0]).join(''));
}

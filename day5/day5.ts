#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/5

import { _ } from "../deps.ts";
import { assert, chunkLines, readLinesFromArgs, safeParseInt, zeros } from "../util.ts";

/** Parse the first part of the input. Index zero = top of stack. */
function parseStacks(stacks: readonly string[]): string[][] {
  const numStacks = 1 + (stacks[0].length + 1) / 4;
  const out: string[][] = zeros(numStacks).map(() => []);
  for (const line of stacks) {
    if (!line.includes('[')) {
      break;  // ignore the "1 2 3 4 5 6 7" line at the end
    }
    for (let i = 1; i < line.length; i += 4) {
      const c = line[i];
      const stack = (i - 1) / 4;
      if (c !== ' ') {
        out[stack].push(c);
      }
    }
  }
  return out;
}

interface Move {
  num: number;
  from: number;  // 1-based
  to: number;  // 1-based
}

function parseMove(move: string): Move {
  const m = move.match(/move (\d+) from (\d+) to (\d+)/);
  assert(m, move);
  const [, num, from, to] = m;
  return _.mapValues({num, from, to}, safeParseInt);
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

  const moves = movesStr.map(parseMove);
  const stacks2 = _.cloneDeep(stacks);
  for (const move of moves) {
    applyMove(stacks, move);
  }
  console.log('part 1', stacks.map(s => s[0]).join(''));

  for (const move of moves) {
    applyMove2(stacks2, move);
  }
  console.log('part 2', stacks2.map(s => s[0]).join(''));
}

#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/5

import { _ } from "../../deps.ts";
import { assert, readLinesFromArgs, tuple } from "../../util.ts";

function react(seq: string): string {
  const parts = seq.split('');
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const a = parts[i];
    if (i === parts.length - 1) {
      out.push(a);
      break;
    }
    const b = parts[i + 1];
    if (a !== b && a.toLowerCase() === b.toLowerCase()) {
      // console.log('boom!', a, b)
      i += 1;
    } else {
      out.push(a);
    }
  }
  return out.join('');
}

function lengthAfterFullyReacting(seq: string): number {
  while (true) {
    const newSeq = react(seq);
    if (seq === newSeq) {
      break;
    }
    seq = newSeq;
    // console.log(seq);
  }
  return seq.length;
}

function removeLetter(seq: string, letter: string): string {
  return seq.replaceAll(letter.toLowerCase(), '').replaceAll(letter.toUpperCase(), '');
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 1);
  const seq = lines[0];

  console.log('part 1', lengthAfterFullyReacting(seq));

  const letters = _.range(0, 26).map(c => String.fromCharCode('A'.charCodeAt(0) + c));
  const results = letters.map(c => tuple(lengthAfterFullyReacting(removeLetter(seq, c)), c));
  const result = _.minBy(results, ([score, _c]) => score);
  console.log('part 2', result);
}

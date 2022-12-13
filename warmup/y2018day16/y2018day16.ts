#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/16

import { _ } from "../../deps.ts";
import { assert, assertUnreachable, chunkLines, readInts, readLinesFromArgs } from "../../util.ts";

/** Split on three blanks */
function split(lines: readonly string[]): [string[], string[]] {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '' && lines[i+1] === '' && lines[i+2] === '') {
      return [lines.slice(0, i), lines.slice(i+3)];
    }
  }
  throw new Error('no split!');
}

interface Observation {
  instruction: [number, number, number, number];
  before: number[];
  after: number[];
}

const ops = [
  'addr',
  'addi',
  'mulr',
  'muli',
  'banr',
  'bani',
  'borr',
  'bori',
  'setr',
  'seti',
  'gtir',
  'gtri',
  'gtrr',
  'eqir',
  'eqri',
  'eqrr'
] as const;
export type Op = typeof ops[number];

export function runOp(
  instruction: readonly [Op, number, number, number],
  before: readonly number[]
): number[] {
  const [op, a, b, c] = instruction;
  const isImmediate = op.endsWith('i');
  const inB = isImmediate ? b : before[b];
  const regA = before[a];
  const out = [...before];
  switch (op) {
    case 'addr':
    case 'addi':
      out[c] = regA + inB;
      break;
    case 'mulr':
    case 'muli':
      out[c] = regA * inB;
      break;
    case 'banr':
    case 'bani':
      out[c] = regA & inB;
      break;
    case 'borr':
    case 'bori':
      out[c] = regA | inB;
      break;
    case 'setr':
    case 'seti':
      out[c] = isImmediate ? a : regA;
      break;
    case 'gtir':
    case 'gtri':
    case 'gtrr': {
      const inA = op[2] === 'i' ? a : regA;
      out[c] = inA > inB ? 1 : 0;
      break;
    }
    case 'eqir':
    case 'eqri':
    case 'eqrr': {
      const inA = op[2] === 'i' ? a : regA;
      out[c] = inA === inB ? 1 : 0;
      break;
    }
    default:
      assertUnreachable(op);
  }
  return out;
}

export function possibleOps(before: readonly number[], opNums: readonly number[], after: readonly number[]): Op[] {
  const [, a, b, c] = opNums;
  return ops.filter(op => _.isEqual(after, runOp([op, a, b, c], before)));
}

function read(lines: readonly string[]) {
  const [opsStr, programLines] = split(lines);
  const obs: Observation[] = chunkLines(opsStr).map(chunk => {
    assert(chunk.length === 3);
    assert(chunk[0].startsWith('Before'));
    assert(chunk[2].startsWith('After'));
    return {
      instruction: readInts(chunk[1], {expect: 4}) as any,
      before: readInts(chunk[0], {expect: 4}),
      after: readInts(chunk[2], {expect: 4}),
    }
  });
  const program = programLines.map(line => readInts(line, {expect: 4}));
  return [obs, program];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [obs, program] = read(lines);
  console.log('part 1', obs.length, program.length);
  console.log('part 2');
}

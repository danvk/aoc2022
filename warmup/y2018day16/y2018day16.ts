#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/16

import { _ } from "../../deps.ts";
import { assert, assertUnreachable, chunkLines, isNonNullish, readInts, readLinesFromArgs, tuple, zeros } from "../../util.ts";

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
  return tuple(obs, program);
}

function deduceOps(observations: Observation[]) {
  const possibilities: Op[][] = zeros(16).map(() => [...ops]);
  for (const obs of observations) {
    const num = obs.instruction[0];
    const possOps = possibleOps(obs.before, obs.instruction, obs.after);
    possibilities[num] = _.intersection(possibilities[num], possOps);
  }

  const soln: (Op|null)[] = zeros(16).map(() => null);
  while (soln.filter(isNonNullish).length < soln.length) {
    const detI = possibilities.findIndex(ops => ops.length === 1);
    if (detI === -1) {
      throw new Error('stuck!');
    }
    const op = possibilities[detI][0];
    soln[detI] = op;
    for (const [i, poss] of possibilities.entries()) {
      possibilities[i] = poss.filter(x => x !== op);
    }
  }
  return soln.filter(isNonNullish);
}

function part1(observations: Observation[]) {
  let n = 0;
  for (const obs of observations) {
    const possOps = possibleOps(obs.before, obs.instruction, obs.after);
    if (possOps.length >= 3) {
      n++;
    }
  }
  return n;
}

function runProgram(program: number[][], ops: Op[]): number[] {
  let reg = [0, 0, 0, 0];
  for (const [opNum, a, b, c] of program) {
    const op = ops[opNum];
    reg = runOp([op, a, b, c], reg);
  }
  return reg;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [obs, program] = read(lines);
  const ops = deduceOps(obs);
  console.log('part 1', part1(obs));
  console.log('part 2', runProgram(program, ops));
}

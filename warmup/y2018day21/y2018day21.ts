#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/19

// Part 1 involved some disassembling and seeing what the first value was that could make
// the program halt.
// Part 2 involved _fully_ disassembling the program and converting it to TypeScript.
// Then I printed values that would cause the program to halt as I first saw them.
// Eventually this stopped printing so I had my answer.
// I'm not sure what the program is doing -- some kind of hash?
// Each value of E is just a function of the previous E, so once it repeats
// you can stop searching: you have the full list of halting values.

import { _ } from "../../deps.ts";
import { assert, assertUnreachable, readInts, readLinesFromArgs, safeParseInt } from "../../util.ts";

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

export type Instruction = readonly [Op, number, number, number];

function readInstruction(txt: string): Instruction {
  const [op, ...nums] = txt.split(' ');
  assert(ops.includes(op as Op));
  assert(nums.length === 3);
  return [op, ...nums.map(safeParseInt)] as unknown as Instruction;
}

export function runOp(
  instruction: Instruction,
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

const es: number[] = [];

function runProgram(
  ip: number,
  instructions: readonly Instruction[],
  registers: number[],
): number[] {
  let count = 0;
  while (true) {
    const n = registers[ip];
    if (n < 0 || n >= instructions.length) {
      return [...registers, count];
    }
    const instruction = instructions[n];
    const preRegisters = registers;
    // if (n === 28) {
    //   es.push(registers[4]);
    //   // console.log(count, n < 10 ? `0${n}` : n, instruction, registers);
    // }
    registers = runOp(instruction, registers);
    console.log(count, n < 10 ? `0${n}` : n, instruction, preRegisters, '->', registers);
    registers[ip]++;
    count++;
    // if (count > 1_000_000_000) {
    //   return registers;
    // }
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines[0].startsWith('#ip '));
  const [ipNum] = readInts(lines[0], {expect: 1});
  const program = lines.slice(1).map(readInstruction);
  console.log(ipNum);
  console.log(program);
  // let registers = [0, 0, 0, 0, 0, 0];
  let registers = [4231, 0, 0, 0, 0, 0];
  registers = runProgram(ipNum, program, registers);
  console.log(registers);

  console.log(es);
  console.log(_.min(es));
}

// 57388
// 10300
//  4231

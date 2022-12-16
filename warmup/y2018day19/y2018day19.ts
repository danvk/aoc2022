#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/19

// This was interesting!
// Part 1 was whatever.
// Part 2 I ran the code long enough to get it into its loop.
// Then I rewrote the instructions into something more and more like
// C until it became clear that this was summing the divisors of 10551361,
// which the initial code put in register 4.
// Since 10551361 = 67 * 157483, the answer is 1 + 67 + 157483 + 10551361

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

function runProgram(
  ip: number,
  instructions: readonly Instruction[],
  registers: number[],
): number[] {
  let count = 0;
  while (true) {
    const n = registers[ip];
    if (n < 0 || n >= instructions.length) {
      return registers;
    }
    const instruction = instructions[n];
    // if (reg0) {
    // }
    console.log(count, n < 10 ? `0${n}` : n, instruction, registers);
    registers = runOp(instruction, registers);
    registers[ip]++;
    count++;
  }
}

// 25242 09 [ "gtrr", 2, 4, 5 ] [ 0, 1,  3154, 9, 10551361, 0 ]
// 25250 09 [ "gtrr", 2, 4, 5 ] [ 0, 1,  3155, 9, 10551361, 0 ]
// 25258 09 [ "gtrr", 2, 4, 5 ] [ 0, 1,  3156, 9, 10551361, 0 ]
// 25266 09 [ "gtrr", 2, 4, 5 ] [ 0, 1,  3157, 9, 10551361, 0 ]
// 93714 09 [ "gtrr", 2, 4, 5 ] [ 0, 1, 11713, 9, 10551361, 0 ]
// 93722 09 [ "gtrr", 2, 4, 5 ] [ 0, 1, 11714, 9, 10551361, 0 ]

//                                A  B     C   D         E     F
//                                0  1     2   3         4     5
// 25237 03 [ "mulr", 1, 2, 5 ] [ 0, 1, 3153,  3, 10551361,    0 ]   #5 = #2
// 25238 04 [ "eqrr", 5, 4, 5 ] [ 0, 1, 3153,  4, 10551361, 3153 ]   #5 = #5=#2==10551361?  (#5 could be 0 or 1)
// 25239 05 [ "addr", 5, 3, 3 ] [ 0, 1, 3153,  5, 10551361,    0 ]   #3 = #5 + #3
// 25240 06 [ "addi", 3, 1, 3 ] [ 0, 1, 3153,  6, 10551361,    0 ]   #3 += 1
// 25241 08 [ "addi", 2, 1, 2 ] [ 0, 1, 3153,  8, 10551361,    0 ]   #2 += 1
// 25242 09 [ "gtrr", 2, 4, 5 ] [ 0, 1, 3154,  9, 10551361,    0 ]   #2 > #4 --> #5 break if #2 > #4
// 25243 10 [ "addr", 3, 5, 3 ] [ 0, 1, 3154, 10, 10551361,    0 ]   #3 += #5
// 25244 11 [ "seti", 2, 3, 3 ] [ 0, 1, 3154, 11, 10551361,    0 ]   #3 = 2

//   ....
//    22 10 [ "addr", 3, 5, 3 ] [ 1, 1, 10551362, 10, 10551361, 1 ]
//    23 12 [ "addi", 1, 1, 1 ] [ 1, 1, 10551362, 12, 10551361, 1 ]
//    24 13 [ "gtrr", 1, 4, 5 ] [ 1, 2, 10551362, 13, 10551361, 1 ]
//    25 14 [ "addr", 5, 3, 3 ] [ 1, 2, 10551362, 14, 10551361, 0 ]
//    26 15 [ "seti", 1, 6, 3 ] [ 1, 2, 10551362, 15, 10551361, 0 ]
//    27 02 [ "seti", 1, 1, 2 ] [ 1, 2, 10551362,  2, 10551361, 0 ]
//    28 03 [ "mulr", 1, 2, 5 ] [ 1, 2,        1,  3, 10551361, 0 ]

// ....

// [ 1, 10551361, 10551362, 12, 10551361, 1 ]

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines[0].startsWith('#ip '));
  const [ipNum] = readInts(lines[0], {expect: 1});
  const program = lines.slice(1).map(readInstruction);
  console.log(ipNum);
  console.log(program);
  // const registers1 = runProgram(ipNum, program, [0, 0, 0, 0, 0, 0]);
  // console.log(registers1);
  // console.log('part 1', registers1[0]);

  // const registers2 = runProgram(ipNum, program, [1, 0, 0, 0, 0, 0]);
  // const registers2 = runProgram(ipNum, program, [ 0, 1, 10551359,  3, 10551361,    0 ]);
  // const registers2 = runProgram(ipNum, program, [ 1, 10551361, 10551362, 12, 10551361, 1 ]);
  // console.log('part 2', registers2);

  let A=1;
  let B=1;
  while (true) {
    A+=B;
    B++;
    if (B == 10551362) {
      break;
    }
  }
  console.log(A);
}

//       10551362 is too low
// 55665614751842 is too high

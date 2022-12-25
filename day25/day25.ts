#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/25

import { _ } from "../deps.ts";
import { readLinesFromArgs } from "../util.ts";

// the digits are 2, 1, 0, minus (written -), and double-minus (written =). Minus is worth -1, and double-minus is worth -2."
// - = -1
// = = -2

type SnafuDigit = '=' | '-' | '0' | '1' | '2';
type SnafuValue = -2 | -1 | 0 | 1 | 2;

const DIGITS: Record<SnafuDigit, SnafuValue> = {
  '2': 2,
  '1': 1,
  '0': 0,
  '-': -1,
  '=': -2,
};

const REV: Record<SnafuValue, SnafuDigit> = {
  '-1': '-',
  '-2': '=',
  '0': '0',
  '1': '1',
  '2': '2',
}

function isSnafuDigit(x: string): x is SnafuDigit {
  return x in DIGITS;
}
function assertSnafuDigit(x: string): SnafuDigit {
  if (!isSnafuDigit(x)) {
    throw new Error('Invalid Snafu digit: ' + x);
  }
  return x;
}

export function snafuToNum(snafu: string): number {
  let scale = 1;
  let num = 0;
  const digits = snafu.split('').map(assertSnafuDigit);
  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits[i];
    num += DIGITS[digit] * scale;
    scale *= 5;
  }
  return num;
}

export function numToSnafu(num: number): string {
  const digits = [];
  while (num) {
    const d = num % 5 as 0 | 1 | 2 | 3 | 4;
    // This type assertion might not be needed if TS understood integers.
    // But that wouldn't be very JavaScript-y!
    const snafuD = (d === 3) ? -2 : (d === 4) ? -1 : d;
    digits.push(REV[snafuD]);
    num -= snafuD;
    num /= 5;
  }
  return _.reverse(digits).join('');
}

// 34978907874317

// 11 % 5 = 1
// 11 - 1 -> 10

// 20 % 5 == 0 -> dig0
// 20 /= 5 -> 4
// 4 % 5 => 4 => -1 dig-
//

// 11
// 1

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const nums = lines.map(snafuToNum);
  const s = _.sum(nums);
  console.log('part 1', numToSnafu(s));
  console.log('part 2');
}

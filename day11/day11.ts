#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/11

import { _ } from "../deps.ts";
import { chunkLines, readInts, readLinesFromArgs } from "../util.ts";

interface Monkey {
  num: number;
  items: number[];
  op: (old: number) => number;
  test: number;
  trueMonkey: number;
  falseMonkey: number;
  numInspected: number;
}

function parseMonkey(chunk: string[]): Monkey {
  let line = chunk.shift()!;
  const [num] = readInts(line, {expect: 1});
  line = chunk.shift()!;
  const items = readInts(line);
  line = chunk.shift()!;
  const [, opStr] = line.split(' = ');
  let op;
  if (opStr === 'old * old') {
    op = (old: number) => old * old;
  } else if (opStr.startsWith('old * ')) {
    const [m] = readInts(opStr, {expect: 1});
    op = (old: number) => old * m;
  } else if (opStr.startsWith('old + ')) {
    const [m] = readInts(opStr, {expect: 1});
    op = (old: number) => old + m;
  } else {
    throw new Error('Unparseable op ' + opStr);
  }

  line = chunk.shift()!;
  const [test] = readInts(line, {expect: 1});
  line = chunk.shift()!;
  const [trueMonkey] = readInts(line, {expect: 1});
  line = chunk.shift()!;
  const [falseMonkey] = readInts(line, {expect: 1});
  return {num, items, op, test, trueMonkey, falseMonkey, numInspected: 0};
}

function round(monkeys: Monkey[], part=1, modulus=0) {
  for (const m of monkeys) {
    while (m.items.length) {
      m.numInspected++;
      let worry = m.items.shift()!;
      worry = m.op(worry);
      if (modulus) {
        worry = worry % modulus;
      }
      if (part === 1) {
        worry = Math.floor(worry / 3);
      }
      if (worry % m.test === 0) {
        monkeys[m.trueMonkey].items.push(worry);
      } else {
        monkeys[m.falseMonkey].items.push(worry);
      }
    }
  }
}

function printItems(monkeys: Monkey[]) {
  for (const m of monkeys) {
    console.log(m.num, m.items);
  }
}

function part1(monkeys: Monkey[]): number {
  printItems(monkeys);
  for (let i = 0; i < 20; i++) {
    round(monkeys);
    // console.log(i);
    // printItems(monkeys);
  }
  const inspects = _.sortBy(monkeys.map(m => m.numInspected)).reverse();
  console.log(inspects);
  return inspects[0] * inspects[1];
}

function part2(monkeys: Monkey[]): number {
  // printItems(monkeys);
  const modulus = monkeys.map(m => m.test).reduce((a, b) => a * b, 1);
  // console.log('modulus', modulus);
  for (let i = 0; i < 10_000; i++) {
    round(monkeys, 2, modulus);

    // if (i + 1 === 1 || i + 1 === 20 || (i + 1) % 1000 === 0) {
    //   console.log('after', 1 + i, 'rounds');
    //   for (const m of monkeys) {
    //     console.log(m.num, 'inspected', m.numInspected);
    //   }
    // }
  }
  const inspects = _.sortBy(monkeys.map(m => m.numInspected)).reverse();
  console.log(inspects);
  return inspects[0] * inspects[1];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const monkeys = chunkLines(lines).map(parseMonkey);
  const monkeys2 = chunkLines(lines).map(parseMonkey);
  console.log('part 1', part1(monkeys));
  console.log('part 2', part2(monkeys2));
}

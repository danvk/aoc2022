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
  const [num] = readInts(line);
  line = chunk.shift()!;
  const items = readInts(line);
  line = chunk.shift()!;
  const [, opStr] = line.split(' = ');
  let op;
  if (opStr === 'old * old') {
    op = (old: number) => old * old;
  } else if (opStr.startsWith('old * ')) {
    const [m] = readInts(opStr);
    op = (old: number) => old * m;
  } else if (opStr.startsWith('old + ')) {
    const [m] = readInts(opStr);
    op = (old: number) => old + m;
  } else {
    throw new Error('Unparseable op ' + opStr);
  }

  line = chunk.shift()!;
  const [test] = readInts(line);
  line = chunk.shift()!;
  const [trueMonkey] = readInts(line);
  line = chunk.shift()!;
  const [falseMonkey] = readInts(line);
  return {num, items, op, test, trueMonkey, falseMonkey, numInspected: 0};
}

function round(monkeys: Monkey[], part=1) {
  for (const m of monkeys) {
    while (m.items.length) {
      m.numInspected++;
      let worry = m.items.shift()!;
      const oldWorry = worry;
      worry = m.op(worry);
      if (m.num === 2) {
        console.log(worry, oldWorry);
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
    console.log(i);
    printItems(monkeys);
  }
  const inspects = _.sortBy(monkeys.map(m => m.numInspected)).reverse();
  console.log(inspects);
  return inspects[0] * inspects[1];
}

// 24543765554 is too high

function part2(monkeys: Monkey[]): number {
  // printItems(monkeys);
  for (let i = 0; i < 10_000; i++) {
    round(monkeys, 2);

    if (i + 1 === 1 || i + 1 === 20 || (i + 1) % 1000 === 0) {
      console.log('after', 1 + i, 'rounds');
      for (const m of monkeys) {
        console.log(m.num, 'inspected', m.numInspected);
      }
    }

    // console.log(i);
    // printItems(monkeys);
  }
  const inspects = _.sortBy(monkeys.map(m => m.numInspected)).reverse();
  console.log(inspects);
  return inspects[0] * inspects[1];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  // const monkeys = chunkLines(lines).map(parseMonkey);
  const monkeys2 = chunkLines(lines).map(parseMonkey);
  // console.log('part 1', part1(monkeys));
  console.log('part 2', part2(monkeys2));
}

#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/10

import { _ } from "../deps.ts";
import { assert, assertUnreachable, readLinesFromArgs, safeParseInt } from "../util.ts";

interface Noop {
  command: 'noop';
}

interface AddX {
  command: 'addx';
  value: number;
}

type Command = AddX | Noop;

function parseCommand(txt: string): Command {
  const [command, ...args] = txt.split(' ');
  if (command === 'noop') {
    assert(args.length === 0);
    return {command: 'noop'};
  } else if (command === 'addx') {
    assert(args.length === 1);
    return {command: 'addx', value: safeParseInt(args[0])};
  }
  throw new Error(`Invalid command: ${txt}`);
}

function run(commands: readonly Command[]) {
  let x = 1;
  let cycles = 0;
  const signals = [];
  for (const command of commands) {
    let n = 0;
    let newX = x;
    if (command.command === 'noop') {
      n = 1;
    } else if (command.command === 'addx') {
      n = 2;
      newX = x + command.value;
    } else {
      assertUnreachable(command);
    }
    for (let i = 0; i < n; i++) {
      cycles++;
      if (cycles % 40 === 20) {
        const signal = cycles * x;
        signals.push(signal);
      }
    }
    x = newX;
  }
  return [_.sum(signals), x, cycles, signals];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const commands = lines.map(parseCommand);
  console.log('part 1', run(commands));
  console.log('part 2');
}

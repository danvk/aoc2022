#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/10

import { _ } from "../deps.ts";
import { assert, assertUnreachable, readLinesFromArgs, safeParseInt, tuple, zeros } from "../util.ts";

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
  const display = zeros(40, 6);
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
      const col = (cycles) % 40;
      const row = (Math.floor((cycles) / 40)) % 6;
      if (Math.abs(x - col) <= 1) {
        display[col][row] = 1;
        if (cycles < 20) {
          console.log('cycle', cycles + 1, 'set', row, col, '=1');
          printDisplay(display);
        }
      } else {
        display[col][row] = 0;
        if (cycles < 20) {
          console.log('cycle', cycles + 1, 'set', row, col, '=0');
          printDisplay(display);
        }
      }
      cycles++;
      if (cycles % 40 === 20) {
        const signal = cycles * x;
        signals.push(signal);
      }
    }
    x = newX;
  }
  return tuple(_.sum(signals), display, x, cycles, signals);
}

function printDisplay(display: number[][]) {
  for (let row = 0; row < display[0].length; row++) {
    const chars = [];
    for (let col = 0; col < display.length; col++) {
      const c = display[col][row];
      chars.push(c === 1 ? '#' : '.');
    }
    console.log(chars.join(''));
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const commands = lines.map(parseCommand);
  const [part1, display, x, cycles] = run(commands);
  console.log('part 1', part1);
  console.log('x=', x);
  console.log('cycles=', cycles);
  console.log('part 2');
  printDisplay(display);
}

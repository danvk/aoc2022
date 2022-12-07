#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/9

import { _ } from "../../deps.ts";
import { assert, safeParseInt, zeros } from "../../util.ts";

interface Marble {
  num: number;
  prev: Marble;
  next: Marble;
}

function playGame(numElves: number, maxMarble: number) {
  const m0: Marble = { num: 0, prev: null!, next: null!};
  const m1: Marble = { num: 1, prev: m0, next: m0};
  m0.prev = m1;
  m0.next = m1;
  let cur = m1;
  const scores = zeros(1 + numElves);
  for (let m = 2; m <= maxMarble; m++) {
    if (m % 10_000 === 0) {
      console.log(m)
    }
    const elf = 1 + ((m - 1) % numElves);
    if (m % 23 !== 0) {
      const cw1 = cur.next;  // m0
      const cw2 = cw1.next;  // m1
      const newM: Marble = {
        num: m,
        prev: cw1,
        next: cw2,
      };
      cw1.next = newM;
      cw2.prev = newM;
      cur = newM;
    } else {
      scores[elf] += m;
      for (let i = 0; i < 7; i++) {
        cur = cur.prev;
      }
      scores[elf] += cur.num;
      cur.prev.next = cur.next;
      cur.next.prev = cur.prev;
      cur = cur.next;
    }
    /*
    const parts = [];
    let c = m0;
    do {
      if (c === cur) {
        parts.push(`(${c.num})`);
      } else {
        parts.push(`${c.num}`);
      }
      c = c.next;
    } while (c !== m0);
    console.log(parts.join(' '));
    */
  }
  console.log(scores);
  return _.max(scores)!;
}

if (import.meta.main) {
  const [numElves, maxMarble] = Deno.args.map(safeParseInt);
  console.log('part 1', playGame(numElves, maxMarble));
  console.log('part 2');
}

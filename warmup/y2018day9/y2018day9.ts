#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/9

import { _ } from "../../deps.ts";
import { safeParseInt, zeros } from "../../util.ts";

function playGame(numElves: number, maxMarble: number) {
  const marbles = [0, 1];
  let curI = 1;
  const scores = zeros(1 + numElves);
  for (let m = 2; m <= maxMarble; m++) {
    if (m % 10_000 === 0) {
      console.log(m)
    }
    const elf = 1 + ((m - 1) % numElves);
    if (m % 23 !== 0) {
      const i = (curI + 1) % marbles.length;
      marbles.splice(i + 1, 0, m);
      curI = i + 1;
    } else {
      scores[elf] += m;
      const i = (curI + marbles.length - 8) % marbles.length;
      const [m2] = marbles.splice(i + 1, 1);
      scores[elf] += m2;
      curI = (i + 1) % marbles.length;
    }
    // console.log(m, marbles.map((x, i) => i === curI ? `(${x})` : x).join(' '));
  }
  console.log(scores);
  return _.max(scores)!;
}

if (import.meta.main) {
  const [numElves, maxMarble] = Deno.args.map(safeParseInt);
  console.log('part 1', playGame(numElves, maxMarble));
  console.log('part 2');
}

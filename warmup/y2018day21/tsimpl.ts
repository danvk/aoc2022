#!/usr/bin/env -S deno run --allow-read --allow-write

const seenEs = new Set<number>();

// const A = 12563078;
const A = 0;
let D = 0;
let E = 0;

while (true) {
  D = E | 65536
  E = 3730679

  // Lines 8-27
  while (true) {
    E = E + (D & 255)
    E = E & 16777215
    E = E * 65899
    E = E & 16777215
    if (D < 256) {
      break
    }
    D = D >> 8
  }

  if (!seenEs.has(E)) {
    console.log(E);
    seenEs.add(E);
  }

  if (E==A) {
    break;
  }
}

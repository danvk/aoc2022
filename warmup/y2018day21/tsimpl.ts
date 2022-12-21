#!/usr/bin/env -S deno run --allow-read --allow-write
const A = 12563078;
// let B = 0;
// let C = 0;
let D = 0;
let E = 0;
let F = 0;

while (true) {
  // Lines 6-7
  D = E | 65536
  E = 3730679

  // Lines 8-27
  while (true) {
    F = D & 255
    E += F
    E = E & 16777215
    E = E * 65899
    E = E & 16777215
    if (D < 256) {
      break
    }
    // F = 0
    // C = 1
    // F = floor(D / 256)
    // D = F
    // D = floor(D / 256)
    D = D >> 8
  }
  console.log(E);
  if (E==A) {
    break;
  }
}

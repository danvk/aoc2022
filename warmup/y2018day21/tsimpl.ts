#!/usr/bin/env -S deno run --allow-read --allow-write

const seenEs = new Map<number, number>();

// const A = 12563078;
// const A = 0;
let E = 0;

function scramble(E: number) {
  let D = E | 65536
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
  return E;
}

let first = null;
let last = null;
while (true) {
  E = scramble(E);

  if (first === null) {
    first = E;
  }
  if (!seenEs.has(E)) {
    // 7705368 is the last thing that this logs.
    // console.log(E);
    seenEs.set(E, seenEs.size);
    last = E;
  } else {
    console.log(E, 'at', seenEs.size, 'was a repeat of', seenEs.get(E));
    break;
  }
}

console.log('part 1', first);
console.log('part 2', last);
console.log('num uniq: ', seenEs.size);

/*
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

}
*/

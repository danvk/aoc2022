#!/usr/bin/env -S deno run --allow-read --allow-write
// Attempt to find periodicity in the input.
// Tries to fit a formula of the form:
//
// value = a * (i // b) + v[i % b] + c if i > d

import { _ } from "../deps.ts";
import { readLinesFromArgs, safeParseInt } from "../util.ts";

function* candidatePeriods(xs: readonly number[]) {
  const n = xs.length;
  for (let b = 1; b < xs.length / 2; b++) {
    const as = _.range(1, 10).map(g => xs[n - g] - xs[n - g - b]);
    if (_.uniq(as).length === 1) {
      yield [b, as[0]];
    }
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const xs = lines.map(safeParseInt);
  for (const b of candidatePeriods(xs)) {
    console.log(b, 'is a candidate');
    // TODO: verify candidate, print the actual formula
  }
}

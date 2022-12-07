#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/8

import { _ } from "../../deps.ts";
import { assert, readLinesFromArgs, safeParseInt } from "../../util.ts";

interface Node {
  children: Node[];
  metadata: number[];
}

function parseNode(nums: number[]): Node {
  const numChildren = nums.shift()!;
  const numMeta = nums.shift()!;
  const children = _.range(0, numChildren).map(() => parseNode(nums));
  const metadata = _.range(0, numMeta).map(() => nums.shift()!);
  return {
    children,
    metadata,
  }
}

function sumMeta(n: Node): number {
  return _.sum(n.metadata) + _.sumBy(n.children, sumMeta);
}

function value(n: Node): number {
  if (n.children.length === 0) {
    return _.sum(n.metadata);
  }
  return _.sum(n.metadata.map(i => {
    if (i === 0 || i > n.children.length) {
      return 0;
    }
    return value(n.children[i - 1]);
  }));
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 1);
  const nums = lines[0].split(' ').map(safeParseInt);
  const root = parseNode(nums);
  assert(nums.length === 0);
  console.log(root);

  console.log('part 1', sumMeta(root));
  console.log('part 2', value(root));
}

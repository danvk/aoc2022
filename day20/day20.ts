#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/20

import { _ } from "../deps.ts";
import { assert, readLinesFromArgs, safeParseInt } from "../util.ts";

interface Node {
  num: number;
  prev: Node;
  next: Node;
}

function makeNodes(nums: number[]): Node[] {
  assert(nums.length);
  const nodes: Node[] = [];
  nodes[0] = {
    num: nums[0],
    prev: null!,
    next: null!,
  };
  for (let i = 1; i < nums.length; i++) {
    nodes.push({
      num: nums[i],
      prev: nodes[i - 1],
      next: null!,
    });
    nodes[i - 1].next = nodes[i];
  }
  nodes[0].prev = nodes[nodes.length - 1];
  nodes[nodes.length - 1].next = nodes[0];
  return nodes;
}

function printList(head: Node) {
  const nums = [];
  let t = head;
  do {
    nums.push(t.num);
    t = t.next;
  } while (t !== head);
  console.log(nums.map(String).join(', '));
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const rawNums = lines.map(safeParseInt);
  const nums = makeNodes(rawNums);
  printList(nums[0]);
  console.log('part 1', nums[0]);
  console.log('part 2');
}

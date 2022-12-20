#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/20

import { _ } from "../deps.ts";
import { assert, readLinesFromArgs, safeParseInt } from "../util.ts";

interface Node {
  num: number;
  prev: Node;
  next: Node;
}

export function makeNodes(nums: number[]): Node[] {
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

export function serializeList(head: Node) {
  const nums = [];
  let t = head;
  do {
    nums.push(t.num);
    t = t.next;
  } while (t !== head);
  return nums;
}

export function printList(head: Node) {
  console.log(serializeList(head).map(String).join(', '));
}

function lengthOfList(head: Node) {
  let len = 0;
  let n = head;
  do {
    len++;
    n = n.next
  } while (n !== head);
  return len;
}

function nAfter(n: Node, num: number) {
  for (let i = 0; i < num; i++) {
    n = n.next;
  }
  return n;
}

export function shift(n: Node, amount: number) {
  let next = n.next;
  if (amount > 0) {
    for (let i = 0; i < amount; i++) {
      next = next.next;
    }
  } else if (amount < 0) {
    for (let i = 0; i >= amount; i--) {
      next = next.prev;
    }
  }

  if (n === next) {
    return;
  }

  // 1, 2, -3, 3, -2, 0, 4
  // A B C D

  // next is n's new next.
  const oldPrev = n.prev;  // A
  const oldNext = n.next;  // C

  //                    4      1            2        1
  // console.log(oldPrev.num, n.num, oldNext.num, next.num);

  // remove n from the list
  oldPrev.next = oldNext;  // A.next = C
  oldNext.prev = oldPrev;  // C.prev = A

  // add it back in the new spot
  n.prev = next.prev;
  n.next = next;           // D
  next.prev = n;      // C
  n.prev.next = n;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const rawNums = lines.map(safeParseInt);
  const nodes = makeNodes(rawNums);
  const before = serializeList(nodes[0]);
  // for (const n of nodes) {
  //   shift(n, n.num);
  // }
  shift(nodes[0], 0);
  shift(nodes[0], nodes.length);
  shift(nodes[0], 2 * nodes.length);
  shift(nodes[0], -nodes.length);
  shift(nodes[0], -2 * nodes.length);

  const after = serializeList(nodes[0]);
  assert(_.isEqual(before, after));

  const zero = nodes.find(n => n.num === 0)!;
  const n1000 = nAfter(zero, 1000).num;
  const n2000 = nAfter(zero, 2000).num;
  const n3000 = nAfter(zero, 3000).num;
  console.log(n1000, n2000, n3000);

  // printList(nums[0]);
  console.log('part 1', n1000 + n2000 + n3000);

  const lens = _.countBy(nodes.map(lengthOfList));
  console.log(lens);

  // -2893 = wrong
  // -9516 = wrong
  // console.log('part 2');
}

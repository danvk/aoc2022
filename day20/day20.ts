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

  // n = 2
  // next = 2

  // next is n's new next.
  const oldPrev = n.prev;  // oldPrev=1
  const oldNext = n.next;  // oldNext=-3

  //                    4      1            2        1
  // console.log(oldPrev.num, n.num, oldNext.num, next.num);

  // remove n from the list
  oldPrev.next = oldNext;  // 1.next = -3
  oldNext.prev = oldPrev;  // -3.prev = 1

  // add it back in the new spot
  n.prev = next.prev;  // 2.prev = 1
  n.next = next;       // 2.next = 2
  next.prev = n;      // 2.prev = 2
  n.prev.next = n;  // 2.next = 2
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const rawNums = lines.map(safeParseInt);
  console.log(rawNums);
  console.log(rawNums.slice(-10));
  const nodes = makeNodes(rawNums);
  const before = serializeList(nodes[0]);
  Deno.writeTextFileSync('/tmp/before.txt', before.map(String).join('\n'));
  console.log(_.sum(rawNums));
  // let i = 0;
  for (const n of nodes) {
    let num = n.num;
    while (num < 0) {
      num += nodes.length;
    }
    num = num % nodes.length;
    shift(n, n.num);
    // i++;
    // const after = serializeList(nodes[i]);
    // Deno.writeTextFileSync(`/tmp/step${i}.txt`, after.map(String).join('\n'));
  }
  // shift(nodes[0], 0);
  // shift(nodes[0], nodes.length);
  // shift(nodes[0], 2 * nodes.length);
  // shift(nodes[0], -nodes.length);
  // shift(nodes[0], -2 * nodes.length);

  // Deno.writeTextFileSync('/tmp/after.txt', after.map(String).join('\n'));
  // assert(_.isEqual(before, after));

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
  // 1786 = too low
  // console.log('part 2');
}

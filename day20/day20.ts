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

function shift(n: Node, amount: number) {
  let next = n.next;
  for (let i = 0; i < amount; i++) {
    next = next.next;
  }

  // 1, 2, -3, 3, -2, 0, 4
  // A B C D

  // next is n's new next.
  const oldPrev = n.prev;  // A
  const oldNext = n.next;  // C

  //                    4      1            2        -3
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
  printList(nodes[0]);
  for (const node of nodes) {
    console.log(node.num, 'prev=', node.prev.num, 'next=', node.next.num);
  }
  shift(nodes[0], nodes[0].num);

  for (const node of nodes) {
    console.log(node.num, 'prev=', node.prev.num, 'next=', node.next.num);
  }
  printList(nodes[0]);

  // printList(nums[0]);
  // console.log('part 1', nums[0]);
  // console.log('part 2');
}

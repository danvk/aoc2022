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

export function shiftLeft(c: Node) {
  // A B C D
  //     |
  // A C B D

  const b = c.prev;
  const d = c.next;
  const a = c.prev.prev;

  a.next = c;
  c.prev = a;
  c.next = b;
  b.prev = c;
  b.next = d;
  d.prev = b;
}

export function shiftRight(b: Node) {
  // A B C D
  //   |
  // A C B D

  const a = b.prev;
  const c = b.next;
  const d = c.next;
  a.next = c;
  c.prev = a;
  c.next = b;
  b.prev = c;
  b.next = d;
  d.prev = b;
}

export function shift(n: Node, amount: number) {
  if (amount > 0) {
    while (amount--) {
      shiftRight(n);
    }
  } else if (amount < 0) {
    while (amount++) {
      shiftLeft(n);
    }
  }

/*
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
  */
}

export function shiftArray(xs: number[], num: number, amount: number): number[] {
  const origAmount = amount;
  while (amount <= -xs.length) {
    amount += xs.length;  // ???
  }
  if (amount < 0) {
    amount += xs.length - 1;
  }
  amount = amount % xs.length;
  if (amount === 0) {
    return [...xs];
  }
  assert(amount > 0, `Bad on ${origAmount}`);
  const i = xs.indexOf(num);
  assert(i >= 0);
  const j = (i + amount) % xs.length;
  const newBefore = xs[j];
  xs.splice(i, 1);
  // console.log(xs);
  const k = xs.indexOf(newBefore);
  const pre = xs.slice(0, k + 1);
  const post = xs.slice(k + 1);
  // console.log(pre);
  // console.log(post);
  return [...pre, num, ...post];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const rawNums = lines.map(safeParseInt);
  const nodes = makeNodes(rawNums);
  const before = serializeList(nodes[0]);
  Deno.writeTextFileSync('/tmp/before.txt', before.map(String).join('\n'));
  console.log(_.sum(rawNums));
  // let i = 0;
  // let nums = [...rawNums];
  // for (const num of rawNums) {
    // nums = shiftArray(nums, num, num);
    // console.log(nums.join(', '));
  // }
  for (const n of nodes) {
    // let num = n.num;
    let amount = n.num;
    // if (amount > 0) {
    amount = amount % (rawNums.length - 1);
    //}
    shift(n, amount);
    // printList(nodes[i]);
    // assert(_.sum(serializeList(nodes[i])) === -659378);
    // i++;
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
  // const i = nums.indexOf(0);
  // const n1000 = nums[(i + 1000) % nums.length];
  // const n2000 = nums[(i + 2000) % nums.length];
  // const n3000 = nums[(i + 3000) % nums.length];
  console.log(n1000, n2000, n3000);

  // printList(nums[0]);
  console.log('part 1', n1000 + n2000 + n3000);

  const lens = _.countBy(nodes.map(lengthOfList));
  console.log(lens);

  // -2893 = wrong
  // -9516 = wrong
  // 1786 = too low
  // -11966 = wrong
  // console.log('part 2');
}

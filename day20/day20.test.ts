import { assertEquals } from '../deps.ts';
import { makeNodes, printList, serializeList, shift, shiftArray, shiftLeft, shiftRight } from './day20.ts';

Deno.test("shift example", () => {
  const nodes = makeNodes([1, 2, -3, 3, -2, 0, 4]);
  shift(nodes[0], 1);
  assertEquals(
    serializeList(nodes.find(n => n.num === 2)!),
    [2, 1, -3, 3, -2, 0, 4]
  );

  shift(nodes[1], 2);
  assertEquals(
    serializeList(nodes.find(n => n.num === 1)!),
    [1, -3, 2, 3, -2, 0, 4]
  );

  // shift(nodes[2], -3);
  shift(nodes[2], -10);
  assertEquals(
    serializeList(nodes.find(n => n.num === 1)!),
    [1, 2, 3, -2, -3, 0, 4]
  );
});

Deno.test('shift left', () => {
  const nodes = makeNodes([1, 2, -3, 3, -2, 0, 4]);
  shiftLeft(nodes[2]);
  assertEquals(
    serializeList(nodes[0]),
    [1, -3, 2, 3, -2, 0, 4],
  );
});

Deno.test('shift right', () => {
  const nodes = makeNodes([1, 2, -3, 3, -2, 0, 4]);
  shiftRight(nodes[0]);
  assertEquals(
    serializeList(nodes.find(n => n.num === 2)!),
    [2, 1, -3, 3, -2, 0, 4]
  );
});

Deno.test("shift to same place", () => {
  const nodes = makeNodes([1, 2, -3, 3, -2, 0, 4]);
  shift(nodes[0], 0);
  assertEquals(
    serializeList(nodes[0]),
    [1, 2, -3, 3, -2, 0, 4]
  );

  shift(nodes[0], 7);
  assertEquals(
    serializeList(nodes[0]),
    [1, 2, -3, 3, -2, 0, 4]
  );

  shift(nodes[0], 14);
  assertEquals(
    serializeList(nodes[0]),
    [1, 2, -3, 3, -2, 0, 4]
  );
});

Deno.test('shift backward to same place', () => {
  const nodes = makeNodes([1, 2, -3, 3, -2, 0, 4]);
  printList(nodes[0]);
  shift(nodes[0], -7);
  printList(nodes[0]);
  assertEquals(
    serializeList(nodes.find(n => n.num === 1)!),
    [1, 2, -3, 3, -2, 0, 4]
  );

  shift(nodes[0], -14);
  assertEquals(
    serializeList(nodes.find(n => n.num === 1)!),
    [1, 2, -3, 3, -2, 0, 4]
  );
});

Deno.test('more examples', () => {
  let before = [4, 5, 6, 1, 7, 8, 9];
  let after = [4, 5, 6, 7, 1, 8, 9];
  let nodes = makeNodes(before);
  shift(nodes[3], 1);
  assertEquals(serializeList(nodes[0]), after);

  before = [4, -2, 5, 6, 7, 8, 9];
  after = [4, 5, 6, 7, 8, -2, 9];
  nodes = makeNodes(before);
  shift(nodes[1], -2);
  assertEquals(serializeList(nodes[0]), after);
});

Deno.test('shift array', () => {
  // let before = [4, 5, 6, 1, 7, 8, 9];
  // assertEquals(
  //   shiftArray(before, 1, 1),
  //   [4, 5, 6, 7, 1, 8, 9]
  // );

  let before = [1, -3, 2, 3, -2, 0, 4];
  assertEquals(
    shiftArray(before, -3, -3),
    [1, 2, 3, -2, -3, 0, 4]
  );

  before = [1, -3, 2, 3, -2, 0, 4];
  assertEquals(
    shiftArray(before, -3, -10),
    [1, 2, 3, -2, -3, 0, 4]
  );
});

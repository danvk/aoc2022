import { assertEquals } from '../deps.ts';
import { makeNodes, printList, serializeList, shift } from './day20.ts';

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

  shift(nodes[2], -3);
  assertEquals(
    serializeList(nodes.find(n => n.num === 1)!),
    [1, 2, 3, -2, -3, 0, 4]
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
});

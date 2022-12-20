import { assertEquals } from '../deps.ts';
import { makeNodes, serializeList, shift } from './day20.ts';

Deno.test("shift forward", () => {
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

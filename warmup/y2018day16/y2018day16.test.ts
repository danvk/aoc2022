import { assertEquals } from '../../deps.ts';
import { runOp } from './y2018day16.ts';

Deno.test("example", () => {
  const before = [3, 2, 1, 1];
  const after = [3, 2, 2, 1];
  const op = [2, 1, 2] as const;

  assertEquals(runOp(['mulr', ...op], before), after);
  assertEquals(runOp(['addi', ...op], before), after);
  assertEquals(runOp(['seti', ...op], before), after);
});

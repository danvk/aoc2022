import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { calcPower } from "./y2018day11.ts";

Deno.test('calcPower', () => {
  assertEquals(calcPower(3, 5, 8), 4);
  assertEquals(calcPower(122,79, 57), -5);
});

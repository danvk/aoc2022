import { assertEquals } from '../deps.ts';
import { numToSnafu, snafuToNum } from './day25.ts';

Deno.test("snafuToNum", () => {
  assertEquals(snafuToNum('21'), 11);
  assertEquals(snafuToNum('1=-0-2'), 1747);
});

Deno.test('numToSnafu', () => {
  assertEquals(numToSnafu(11), '21');
  // assertEquals(numToSnafu(1747), '1=-0-2');
  assertEquals(numToSnafu(20), '1-0');
});

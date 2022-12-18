import { assertEquals } from '../../deps.ts';
import { extractAlternatives, extractParen, parseRegex, splitOnParens } from './y2018day20.ts';

Deno.test("extractParen", () => {
  assertEquals(
    extractParen('(123)abc'),
    '123',
  );

  assertEquals(
    extractParen('(12(3)(a(b))c)xyz'),
    '12(3)(a(b))c',
  );
});

Deno.test("extractAlternatives", () => {
  assertEquals(
    extractAlternatives('a|b|c'),
    ['a', 'b', 'c']
  );
  assertEquals(
    extractAlternatives('a|b|'),
    ['a', 'b', '']
  );
  assertEquals(
    extractAlternatives('a(x|y)|b|'),
    ['a(x|y)', 'b', '']
  );
  assertEquals(
    extractAlternatives('abc'),
    ['abc'],
  );
});

Deno.test('splitOnParens', () => {
  assertEquals(
    splitOnParens('A(B)C'),
    ['A', '(B)', 'C'],
  );

  assertEquals(
    splitOnParens('A(B)(C|D)'),
    ['A', '(B)', '(C|D)'],
  );

  assertEquals(
    splitOnParens('A(B(1|2))C(D|E)'),
    ['A', '(B(1|2))', 'C', '(D|E)'],
  );
});

Deno.test('parseRegex', () => {
  assertEquals(parseRegex('ABC'), {type: 'literal', literal: 'ENN', delta: [1, -2]});
  assertEquals(parseRegex(''), {type: 'literal', literal: '', delta: [0, 0]});
});

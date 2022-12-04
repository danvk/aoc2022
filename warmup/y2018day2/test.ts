import { assert } from "../../deps.ts";
import { hasThree, hasTwo } from "./y2018day2.ts";

Deno.test('hasTwo', () => {
    assert(!hasTwo('abcdef'));
    assert(hasTwo('bababc'));
    assert(hasTwo('abbcde'));
    assert(!hasTwo('abcccd'));
    assert(hasTwo('aabcdd'));
    assert(hasTwo('abcdee'));
    assert(!hasTwo('ababab'));
});

Deno.test('hasThree', () => {
    assert(!hasThree('abcdef'));
    assert(hasThree('bababc'));
    assert(!hasThree('abbcde'));
    assert(hasThree('abcccd'));
    assert(!hasThree('aabcdd'));
    assert(!hasThree('abcdee'));
    assert(hasThree('ababab'));
});

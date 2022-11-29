// https://adventofcode.com/2018/day/2

import { readLinesFromArgs } from "../util.ts";

function hasNOfAny(text: string, n: number): boolean {
    const counts = new Map<string, number>();
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        counts.set(c, 1 + (counts.get(c) ?? 0));
    }
    for (const v of counts.values()) {
        if (v === n) {
            return true;
        }
    }
    return false;
}

export const hasTwo = (text: string) => hasNOfAny(text, 2);
export const hasThree = (text: string) => hasNOfAny(text, 3);

function numDiffs(a: string, b: string): number {
    let n = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            n++;
        }
    }
    return n;
}

function findThePair(lines: string[]): [string, string] {
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            const a = lines[i];
            const b = lines[j];
            if (numDiffs(a, b) == 1) {
                return [a, b];
            }
        }
    }
    throw new Error('No two only have one diff');
}

function commonChars(a: string, b: string): string {
    let out = '';
    for (let i = 0; i < a.length; i++) {
        if (a[i] === b[i]) {
            out += a[i];
        }
    }
    return out;
}

if (import.meta.main) {
    const lines = await readLinesFromArgs();
    const numTwos = lines.filter(hasTwo).length;
    const numThrees = lines.filter(hasThree).length;
    console.log('part 1', numTwos * numThrees, '=', numTwos, '*', numThrees);

    const pair = findThePair(lines);
    console.log('part 2', commonChars(...pair), pair);
}

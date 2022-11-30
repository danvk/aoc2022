// https://adventofcode.com/2018/day/2

import { readLinesFromArgs } from "../util.ts";

interface Claim {
    num: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

function parseClaim(claim: string): Claim {
    // #1 @ 1,3: 4x4
    const m = claim.match(/^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)$/);
    if (!m) {
        throw new Error(`Unable to parse ${claim}`);
    }
    const [, num, x, y, w, h] = m;
    return {
        num: Number(num),
        x: Number(x),
        y: Number(y),
        w: Number(w),
        h: Number(h),
    };
}

function countOverlaps(claims: readonly Claim[]): number {
    const counts: {[xy: string]: number} = {};
    for (const claim of claims) {
        for (let x = claim.x; x < claim.x + claim.w; x++) {
            for (let y = claim.y; y < claim.y + claim.h; y++) {
                const key = `${x},${y}`;
                counts[key] = 1 + (counts[key] ?? 0);
            }
        }
    }

    let contestedClaims = 0;
    for (const [_k, v] of Object.entries(counts)) {
        if (v > 1) {
            // console.log(k);
            contestedClaims++;
        }
    }
    return contestedClaims;
}

function findUncontestedClaim(claims: readonly Claim[]): Set<number> {
    const conflicts = new Set<number>();

    const map: {[xy: string]: number} = {};
    for (const claim of claims) {
        for (let x = claim.x; x < claim.x + claim.w; x++) {
            for (let y = claim.y; y < claim.y + claim.h; y++) {
                const key = `${x},${y}`;
                const prev = map[key];
                if (prev !== undefined) {
                    conflicts.add(prev);
                    conflicts.add(claim.num);
                } else {
                    map[key] = claim.num;
                }
            }
        }
    }

    const validClaims = new Set<number>();
    for (const claim of claims) {
        if (!conflicts.has(claim.num)) {
            validClaims.add(claim.num);
        }
    }

    return validClaims;
}

if (import.meta.main) {
    const lines = await readLinesFromArgs();
    const claims = lines.map(parseClaim);
    // console.log(claims);
    console.log('part 1', countOverlaps(claims));
    console.log('part 2', findUncontestedClaim(claims));
}

# Advent of Code 2022

## Daily Notes

### Day 9 (31369 / 23800)

Key part for part 2 today was to realize that the tail's movement is independent of the head's movement. Rather, it's just a function of the head and tail's position. I was very happy that my solution just worked the first time on this one, I think it would have been a PITA to debug.

Star 1: ~23 minutes
Star 2: ~40 minutes

### Day 8 (41149 / 34438)

Good opportunity to implement `transpose` in part 1. I thought part 2 was easier than part 1, though I'm curious why `3a494d6` gave me an infinite loop until I refactored it from a `for` loop to a `while` loop.

Star 1: ~11 minutes
Both: ~20 minutes

### Day 7 (35036 / 33194)

Eerily reminiscent of one of Sidewalk's interview questions! Storing a pointer to the parent node was helpful for that question, and was also a good strategy here.

### Day 6 (62854 / 61636)

I got the samples wrong on part two but the answer right. What's going on?

Here was the bug:

```
 function findFirstMarker(chars: readonly string[], n: number): number {
-  for (let i = n - 1; i < chars.length; i++) {
+  for (let i = 0; i < chars.length - n; i++) {
     const s = new Set(chars.slice(i, i + n));
```

So if the first marker was in the first N characters, I'd miss it, which is much more likely to happen in the sample inputs than the real input.

For kicks, I also added a linear implementation that performs the same regardless of sliding window length.

Deno's aggressive autocomplete when you hit the `,` key is quite annoying. Filed <https://github.com/denoland/vscode_deno/issues/757>.

### Day 5 (49161 / 47164)

Immediate reaction after seeing the input: "crap, they're going to make us do Towers of Hanoi on day 5!?" Fortunately not but maybe that will come later.

My parser was pretty half-assed, but even so, converting the inputs to JSON might have been the speedier move today.

The only tricky bit today was remembering which direction all your arrays went. Was zero the top or the bottom?

### Day 4 (68911 / 66646)

Saw the clock was midnight when I was going to bed last night and thought about opening up AoC. But I couldn't find my laptop so I just went to bed. Probably the right decision!

I remember that there's a simple expression for whether two intervals overlap, but it always takes some head scratching to remember what that expression is.

[deno_dom](https://deno.land/x/deno_dom@v0.1.36-alpha) is nice. I used it today to make my setup script write out all the code samples to text files.

### Day 3 (58736 / 53036)

Had a few off-by-one errors, as well as an off-by-26 error.

### Day 2 (69695 / 64681)

An opportunity to use one of my favorite tricks: exhaustiveness checking with a cross product of unions using template literal types.

### Day 1 (58706 / 55390)

Reading the input file into "chunks" has been a theme in past years, too.
I got a wrong answer on part two because of an annoying JS footgun:

    declare let sums: number[];
    sums.sort();  // sorts sums lexicographically!

Reference for using lodash with Deno: <https://github.com/lodash/lodash/issues/5411>. Getting types seems like a real headache https://stackoverflow.com/a/66073607/388951.

Solution via Twitter https://twitter.com/brenelz/status/1598503663097503744

    // @deno-types="npm:@types/lodash"
    import _ from "npm:lodash";

## Setup

https://deno.land/manual@v1.28.2/getting_started/setup_your_environment

    $ brew install deno
    $ deno --version
    deno 1.28.2 (release, aarch64-apple-darwin)
    v8 10.9.194.1
    typescript 4.8.3

Hopefully they release a new version with TS 4.9 soon, so I can try `satisfies`.

There's a plugin for VS Code, as well as for zsh completions.

Deno's non-web APIs are documented at <https://deno.land/api@v1.28.2>

Do you actually have to specify a version number for all std imports? This seems crazy. <https://deno.land/manual@v1.28.2/getting_started/first_steps#reading-a-file>

```ts
import { copy } from "https://deno.land/std@0.166.0/streams/conversion.ts";
```

I got an error on this in VS Code until I used the "Quick Fix" to cache it.

Ah!

> Since it can be unwieldy to import URLs everywhere, best practice is actually to import and re-export your external libraries into a central deps.ts file

The marketing is that `deps.ts` serves the same role as `package.json`.

There are some slightly weird things about the tutorial, e.g. referring to the author's personal website and an unused variable in this example <https://deno.land/manual@v1.28.2/getting_started/first_steps#putting-it-all-together-in-an-http-server>. Filed <https://github.com/denoland/manual/issues/464>.

Some of the example in docs look like this:

```ts
import { copy } from "https://deno.land/std@$STD_VERSION/streams/conversion.ts";
```

Is `$STD_VERSION` actual syntax or is the idea that you fill this in yourself?

This may be a helpful reference for debugging Deno code in VSCode <https://deno.land/manual@v1.12.2/getting_started/debugging_your_code#vscode>.

- "All APIs that are not web standard are contained in the global Deno namespace."
- You can use threads via Web Workers <https://deno.land/manual@v1.12.2/runtime/workers>
- Modules are cached in `~/Library/Caches/deno`
- You can use `deno --no-check` to skip type-checking
- Deno runs TypeScript with `--strict` by default
- Deno always runs TypeScript with the `isolatedModules` option.
- Deno uses `swc` under the hood so it doesn't support `const enum` and other runtime features
- Deno supports top-level `await`
- You can spawn subprocesses with `Deno.run`
- Reference for built-in unit test runner https://deno.land/manual@v1.12.2/testing
- Deno has built-in code coverage tools. I should look at `genhtml` https://deno.land/manual@v1.12.2/testing/coverage
- You get a REPL with `deno repl`
- Deno has a standard code formatter (`deno fmt`)
- `deno info file.ts` will print all the transitive dependencies it pulls in
- `deno lint` is a built-in linter. This seems to be a Rust rewrite of the recommended eslint rules with a goal of being very fast.

## Questions

- Is the `deps.ts` system ubiquitous? Do people also create a `devDeps.ts`?
- What are some large projects built using Deno?
- Is it typical to use lodash with Deno? Is there a more Deno-y equivalent?
- Is there a deno equivalent of a shebang line?

## Notes

I'm using `Set` and `Map` a lot more than I usually do. One footgun is that `key in set` does not work like you'd hope.
I'm thinking that <code>obj[`${x},${y}`]</code> is the JS equivalent of a Python dict keyed by `(x, y)` tuples.

## Background

My first recollection of Deno is from a talk at tsconf 2019. My mental model is "an attempt to redo Node.js with the benefit of hindsight." I liked Deno's approach to security (you can't do much without explicit permissions) but I also remember having some questions about how transitive dependencies would work.

When they announced deno.land, I was briefly bummed that someone else had already published a CSV parser (a perennial interest of mine and a source of dissatisfaction with Node.js). Then I realized I had no interest in maintaining a CSV parser for a runtime I didn't actively use.

I'm interested in Deno as "a new way to TypeScript" and curious to what extent it feels different than Node. My sense is that they've converged a bit over the past few years since Node now includes more web-compatible APIs like `fetch`.

I'm also curious to use JS / TS for more numerical, performance-sensitive work. My sense is that it's not as nice as Python for this sort of thing, but it will be a new domain for me to use a familiar language. Plus, I haven't been writing much TypeScript (or code in general) the past few months, and I'd like to get back into it!

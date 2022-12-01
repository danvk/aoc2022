# Advent of Code 2022

## Daily Notes

### Day 1

Reading the input file into "chunks" has been a theme in past years, too.
I got a wrong answer on part two, but I don't think for an interesting reason -- I think I ran my code before saving the file.

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

# Advent of Code 2022

## Setup

https://deno.land/manual@v1.28.2/getting_started/setup_your_environment

    $ brew install deno
    $ deno --version
    deno 1.28.2 (release, aarch64-apple-darwin)
    v8 10.9.194.1
    typescript 4.8.3

Hopefully they release a new version with TS 4.9 soon, so I can try `satisfies`.

There's a plugin for VS Code, as well as for zsh completions.

## Background

My first recollection of Deno is from a talk at tsconf 2019. My mental model is "an attempt to redo Node.js with the benefit of hindsight." I liked Deno's approach to security (you can't do much without explicit permissions) but I also remember having some questions about how transitive dependencies would work.

When they announced deno.land, I was briefly bummed that someone else had already published a CSV parser (a perennial interest of mine and a source of dissatisfaction with Node.js). Then I realized I had no interest in maintaining a CSV parser for a runtime I didn't actively use.

I'm interested in Deno as "a new way to TypeScript" and curious to what extent it feels different than Node. My sense is that they've converged a bit over the past few years since Node now includes more web-compatible APIs like `fetch`.

I'm also curious to use JS / TS for more numerical, performance-sensitive work. My sense is that it's not as nice as Python for this sort of thing, but it will be a new domain for me to use a familiar language. Plus, I haven't been writing much TypeScript (or code in general) the past few months, and I'd like to get back into it!

export { assert, assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";

// @deno-types="npm:@types/lodash"
import {default as ld} from "npm:lodash";
export const _ = ld;

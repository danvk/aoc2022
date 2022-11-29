import { conversion } from "./deps.ts";

const filenames = Deno.args;
for (const filename of filenames) {
  const file = await Deno.open(filename);
  await conversion.copy(file, Deno.stdout);
  file.close();
}

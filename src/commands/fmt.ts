import { Command } from "@cliffy/command";
import * as path from "@std/path";
import { fmt } from "src/fmt.ts";

export const fmtCommand = new Command()
  .description("fmt llms.txt file.")
  .arguments("[dir:string]")
  .action(async (_options, dir) => {
    if (!dir) dir = Deno.cwd();
    const result = await fmt(
      path.join(dir, dir.endsWith("llms.txt") ? "" : "llms.txt"),
    );
    return result;
  });

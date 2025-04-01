import { Command } from "@cliffy/command";
// import { Confirm, Input, Select } from "@cliffy/prompt";

// import { colors } from "@cliffy/ansi/colors";

// import type { LogLevel } from "@polyseam/cconsole";

import deno_json from "../deno.json" with { type: "json" };

// import { cconsole } from "cconsole";

import { lintCommand } from "./lint.ts";
import { fmtCommand } from "./fmt.ts";

export async function llmsTxt() {
  return await new Command()
    .name("llms-txt")
    .description("CLI utility for linting and formatting llms.txt files")
    .version(deno_json.version)
    .command("lint", lintCommand)
    .command("fmt", fmtCommand)
    .parse(Deno.args);
}

import { assert } from "@std/assert";
import { fmt, markdownToLlmsTxt } from "./fmt.ts";
// import * as path from "@std/path";

Deno.test("markdown to llms.txt", function formatStringAsLlmsTxt() {
  const unformatted = Deno.readTextFileSync(
    "mocks/fmt/consolidate-summary/llms.txt",
  );
  const formatted = markdownToLlmsTxt(unformatted);
  const lines = formatted.split("\n");
  const summaryLineIndex = 2;
  assert(lines[summaryLineIndex].startsWith("> "));
  assert(
    lines.findLastIndex((line) => line.startsWith("> ")) === summaryLineIndex,
  );
});

Deno.test("format llms.txt", async function formatLlmsTxt() {
  const pathToCurrent = "mocks/fmt/general-markdown-formatting/llms.txt";
  const _input = Deno.readTextFileSync(
    pathToCurrent,
  );

  const _result = await fmt(pathToCurrent);

  const after = Deno.readTextFileSync(pathToCurrent);

  console.log("after", after);

  const reference = Deno.readTextFileSync(
    "mocks/fmt/general-markdown-formatting/llms.reference.md",
  );

  await Deno.copyFile(
    "mocks/fmt/general-markdown-formatting/llms.bak.txt",
    pathToCurrent,
  );
  assert(
    after === reference,
  );
});

import { assert } from "@std/assert";
import { fmt } from "src/fmt.ts";

Deno.test("markdown to llms.txt", async function formatStringAsLlmsTxt() {
  const pathToCurrent = "src/test/mocks/fmt/consolidate-summary/llms.txt";

  await fmt(pathToCurrent);

  const llmsTxtFormatted = Deno.readTextFileSync(pathToCurrent);
  const lines = llmsTxtFormatted.split("\n");
  const summaryLineIndex = 2;
  assert(lines[summaryLineIndex].startsWith("> "));
  assert(
    lines.findLastIndex((line) => line.startsWith("> ")) === summaryLineIndex,
  );
  Deno.copyFileSync(
    "src/test/mocks/fmt/consolidate-summary/llms.bak.txt",
    pathToCurrent,
  );
});

Deno.test("format llms.txt", async function formatLlmsTxt() {
  const pathToCurrent =
    "src/test/mocks/fmt/general-markdown-formatting/llms.txt";
  const _input = Deno.readTextFileSync(
    pathToCurrent,
  );

  await fmt(pathToCurrent);

  const after = Deno.readTextFileSync(pathToCurrent);

  const reference = Deno.readTextFileSync(
    "src/test/mocks/fmt/general-markdown-formatting/llms.reference.md",
  );

  await Deno.copyFile(
    "src/test/mocks/fmt/general-markdown-formatting/llms.bak.txt",
    pathToCurrent,
  );

  assert(
    after === reference,
  );
});

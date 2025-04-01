import { assert } from "@std/assert";
import { parse } from "src/parse.ts";
import { LlmsTxt, LlmsTxtError } from "src/llms-txt.ts";

const failedWithStatus = (
  expected: number,
  result: LlmsTxtError | LlmsTxt,
) => {
  if (result instanceof LlmsTxt) {
    throw new LlmsTxtError(
      "LlmsTxt parsed successfully but error was expected:",
      expected,
    );
  } else {
    assert(result instanceof LlmsTxtError);
    return result.status === expected;
  }
};

Deno.test(function titleMissing() {
  assert(
    failedWithStatus(1, parse("src/test/mocks/parse/title-missing/llms.txt")),
  );
});

Deno.test(function titleTooShort() {
  assert(
    failedWithStatus(2, parse("src/test/mocks/parse/title-too-short/llms.txt")),
  );
});

Deno.test(function noNewlineAfterTitle() {
  assert(
    failedWithStatus(
      3,
      parse("src/test/mocks/parse/no-newline-after-title/llms.txt"),
    ),
  );
});

Deno.test(function multilineBlockquoteSummary() {
  assert(
    failedWithStatus(
      4,
      parse("src/test/mocks/parse/multiline-blockquote-summary/llms.txt"),
    ),
  );
});

Deno.test(function fileNotFound() {
  assert(
    failedWithStatus(
      404,
      parse("src/test/mocks/parse/file-not-found/llms.txt"),
    ),
  );
});

Deno.test(function valid() {
  const valid = parse("src/test/mocks/parse/valid/llms.txt");
  assert(valid instanceof LlmsTxt);
});

Deno.test(function selfParse() {
  const parsed = parse("./llms.txt");
  console.log(parsed);
});

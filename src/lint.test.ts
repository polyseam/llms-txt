import { assert } from "@std/assert";
import { lint, LLMSTxtLintResult } from "./lint.ts";

const failedWithStatus = (
  expected: number,
  { status, message }: LLMSTxtLintResult,
) => {
  console.error(`Error ${status}`, message);
  return status === expected;
};

Deno.test(function titleMissing() {
  assert(failedWithStatus(1, lint("mocks/lint/title-missing/llms.txt")));
});

Deno.test(function titleTooShort() {
  assert(failedWithStatus(2, lint("mocks/lint/title-too-short/llms.txt")));
});

Deno.test(function noNewlineAfterTitle() {
  assert(
    failedWithStatus(3, lint("mocks/lint/no-newline-after-title/llms.txt")),
  );
});

Deno.test(function multilineBlockquoteSummary() {
  assert(
    failedWithStatus(
      4,
      lint("mocks/lint/multiline-blockquote-summary/llms.txt"),
    ),
  );
});

Deno.test(function fileNotFound() {
  assert(failedWithStatus(404, lint("mocks/lint/file-not-found/llms.txt")));
});

Deno.test(function failedToReadFile() {
  assert(
    failedWithStatus(500, lint("mocks/lint/failed-to-read-file/llms.txt")),
  );
});

Deno.test(function valid() {
  const valid = lint("mocks/lint/valid/llms.txt");
  assert(valid?.status === 0);
  assert(valid?.ok === true);
});

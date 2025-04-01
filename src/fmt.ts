import { Command } from "@cliffy/command";
import * as path from "@std/path";

type AbsolutePath = string;
type DidChange = boolean;

type LLMSTxtFmtResult = {
  didChange?: DidChange;
};

/**
 * Converts a markdown formatted string to an llms.txt formatted string.
 *
 * This function splits the input text into its constituent lines assuming that the first three lines
 * represent the title, a blank line, and an initial summary line. If the summary line starts with "> ",
 * it inspects subsequent lines that also start with "> " and merges them into the summary until a line
 * that does not start with "> " is encountered. The remaining lines are appended without processing.
 *
 * @param text - The input text in markdown format.
 * @returns The transformed string in llms txt format.
 *
 * @example
 * ```typescript
 * const input = "Title\n\n> Summary part 1\n> Summary part 2\nContent line";
 * const result = markdownToLlmsTxt(input);
 * // Result:
 * // "Title\n\n> Summary part 1 Summary part 2\nContent line"
 * ```
 */
export function markdownToLlmsTxt(text: string): string {
  const [title, blankspace, summaryLn, ...lines] = text.split("\n");
  let mergeComplete = false;

  let summary = summaryLn;

  const finalLines: string[] = [];

  // ensure that if the summary spans multiple lines, it is merged into one
  if (summary.startsWith("> ")) {
    console.log();
    for (const line of lines) {
      if (!mergeComplete) {
        if (line.startsWith("> ")) {
          summary += ` ${line.slice(2)}`;
          continue;
        } else {
          mergeComplete = true;
          finalLines.push(line);
          // continue;
        }
      }
      finalLines.push(line);
    }
  }

  return [title, blankspace, summary, ...finalLines].join("\n");
}

export async function fmt(
  llmsTxtPath: string,
): Promise<LLMSTxtFmtResult> {
  const llmsTxtMdPath = llmsTxtPath.replace("llms.txt", "llms.txt.md");
  const ogText = await Deno.readTextFile(llmsTxtPath);

  // deno fmt will only format the file if it ends with .md
  await Deno.writeTextFile(
    llmsTxtMdPath,
    ogText,
  );

  const cmd = new Deno.Command("deno", {
    args: ["fmt", llmsTxtMdPath],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr } = await cmd.output();
  const d = new TextDecoder();

  if (code !== 0) {
    console.error("Error formatting file:", d.decode(stderr));
    await Deno.remove(llmsTxtMdPath);
    return {
      didChange: false,
    };
  } else {
    const denoFormatted = await Deno.readTextFile(llmsTxtMdPath);

    const llmsTxtFormatted = markdownToLlmsTxt(denoFormatted);

    // `deno fmt` and dedicated `llms.txt` formatting together yielded no changes
    if (llmsTxtFormatted === ogText) {
      await Deno.remove(llmsTxtMdPath);
      return { didChange: false };
    }

    // `deno fmt` made changes but `llms.txt` formatting did not
    if (llmsTxtFormatted === denoFormatted) {
      await Deno.remove(llmsTxtMdPath);
      return { didChange: true };
    }

    await Deno.writeTextFile(llmsTxtMdPath, llmsTxtFormatted);
    await Deno.remove(llmsTxtPath);
    await Deno.rename(llmsTxtMdPath, llmsTxtPath);

    return {
      didChange: true,
    };
  }
}

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

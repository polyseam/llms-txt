import { cconsole } from "cconsole";

type DidChange = boolean;

type LLMSTxtFmtResult = {
  didChange?: DidChange;
};

/**
 * Converts a markdown string into properly formatted "llms.txt" text.
 *
 * The function processes a markdown text by extracting the title, a blank line,
 * the first line of the summary, and subsequent content lines. If the summary line
 * continues into multiple lines (i.e., lines beginning with "> "), these lines are
 * merged into a single summary string. The resulting format maintains the original
 * title and blank line, followed by the merged summary and remaining content.
 *
 * @param text - The markdown formatted string that includes a title, a blank line,
 *               a summary line possibly extending over multiple lines,
 *               additional content, and links.
 * @returns A transformed string in the "llms.txt" format.
 */
export function markdownToLlmsTxt(text: string): string {
  const [title, blankspace, summaryLn, ...lines] = text.split("\n");

  let mergeComplete = false;

  let summary = summaryLn;

  const finalLines: string[] = [];

  // ensure that if the summary spans multiple lines, it is merged into one
  if (summary.startsWith("> ")) {
    for (const line of lines) {
      if (!mergeComplete) {
        if (line.startsWith("> ")) {
          summary += ` ${line.slice(2)}`;
          continue;
        } else {
          mergeComplete = true;
          finalLines.push(line);
          continue;
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
    cconsole.error("Error formatting file:", d.decode(stderr));
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

    await Deno.writeTextFile(llmsTxtMdPath, llmsTxtFormatted);
    await Deno.remove(llmsTxtPath);
    await Deno.rename(llmsTxtMdPath, llmsTxtPath);

    console.log(llmsTxtPath);
    console.log("Checked 1 file");

    return {
      didChange: true,
    };
  }
}

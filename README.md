# llms-txt

## usage

```jsonc
{
  "tasks": {
    "fmt-llms-txt": {
      "command": "deno run -A jsr:@polyseam/llms-txt fmt"
    },
    "lint-llms-txt": {
      "command": "deno run -A jsr:@polyseam/llms-txt parse"
    }
  }
}
```

## llms-txt spec

The [llms.txt](https://llmstxt.org) standard promotes a simple pattern of
exposing a markdown document that is maximally useful for LLMs. It is largely
pure markdown but follows a few simple rules to make it more useful for LLMs.

The content should be as follows:

1. The first line of the document is a title, in typical markdown fashion this
   looks like:
   ```markdown
   # my-project
   ```

   This is the only required field!

2. We also should add a summary, a one-line blockquote on line `3` of the file:

   ```markdown
   # my-project

   > This is a summary of my project in just a single line.
   ```

   This should always be a single line, and should be a summary of the project.

   It is not required, but it is highly recommended.

3. Next the file should contain zero or more markdown elements which are **not**
   headings:

   ```markdown
   # my-project

   > This is a summary of my project in just a single line.

   Here's an example including some content which does not contain a heading!

   It can be useful to provide any content here which isn't simply a link to
   external content elsewhere.
   ```
4. The final section of the file is a list second-level headings, and a
   corresponding list of links

   ```markdown
   # my-project

   > This is a summary of my project in just a single line.

   ## community

   - [community website](https://example.org)
   - [discord](https://example.org/discord): Please join us, we love bots!

   ## docs

   - [docs](https://example.org/docs)
   ```

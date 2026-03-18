import * as p from "@clack/prompts";
import pc from "picocolors";
import type { ScaffoldOptions } from "./types";

export async function runPrompts(
  projectName?: string,
): Promise<ScaffoldOptions> {
  p.intro(pc.bgCyan(pc.black(" create-bungkus ")));

  const options = await p.group(
    {
      name: () =>
        projectName
          ? Promise.resolve(projectName)
          : p.text({
              message: "Project name:",
              placeholder: "my-app",
              validate: (value) => {
                if (!value) return "Project name is required";
              },
            }),

      base: () =>
        p.select({
          message: "Which base template?",
          options: [
            { value: "astro-default", label: "Astro" },
            { value: "astro-react", label: "Astro + React" },
            { value: "astro-vue", label: "Astro + Vue" },
          ],
        }),

      css: () =>
        p.select({
          message: "Which CSS framework?",
          options: [
            { value: "tailwindcss", label: "Tailwind CSS" },
            { value: "none", label: "None" },
          ],
        }),

      formatter: () =>
        p.select({
          message: "Which formatter?",
          options: [
            { value: "prettier", label: "Prettier" },
            { value: "biome", label: "Biome" },
            { value: "none", label: "None" },
          ],
        }),

      linter: () =>
        p.select({
          message: "Which linter?",
          options: [
            { value: "eslint", label: "ESLint" },
            { value: "none", label: "None" },
          ],
        }),

      deploy: () =>
        p.select({
          message: "Deploy target?",
          options: [
            { value: "wrangler", label: "Cloudflare (Wrangler)" },
            { value: "none", label: "None" },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    },
  );

  return options as ScaffoldOptions;
}

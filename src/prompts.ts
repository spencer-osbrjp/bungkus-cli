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

      extras: () =>
        p.multiselect({
          message: "Select extras:",
          options: [
            { value: "tailwindcss", label: "Tailwind CSS" },
            { value: "prettier", label: "Prettier" },
            { value: "biome", label: "Biome" },
            { value: "eslint", label: "ESLint" },
            { value: "wrangler", label: "Wrangler (Cloudflare)" },
          ],
          required: false,
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

import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import type { GeneratorContext, ScaffoldOptions } from "./types";
import { baseGenerators } from "./generators/base";
import { extraGenerators } from "./generators/extras";
import { detectPackageManager } from "./package-manager";

export async function scaffold(options: ScaffoldOptions) {
  const projectDir = path.resolve(process.cwd(), options.name);
  const packageManager = detectPackageManager();
  const ctx: GeneratorContext = {
    projectDir,
    projectName: options.name,
    packageManager,
  };

  const s = p.spinner();

  // Run base generator
  const base = baseGenerators[options.base];
  if (!base) {
    p.cancel(`Unknown base template: ${options.base}`);
    process.exit(1);
  }

  s.start(`Scaffolding ${pc.cyan(options.base)}...`);
  await base.run(ctx);
  s.stop(`${pc.green("✓")} Base template ready`);

  // Run extra generators
  for (const extra of options.extras) {
    const generator = extraGenerators[extra];
    if (!generator) continue;

    s.start(`Setting up ${pc.cyan(generator.name)}...`);
    await generator.run(ctx);
    s.stop(`${pc.green("✓")} ${generator.name} configured`);
  }

  p.outro(
    `${pc.green("Done!")} Run the following to get started:\n\n  cd ${options.name}\n  ${packageManager} install\n  ${packageManager} run dev`,
  );
}

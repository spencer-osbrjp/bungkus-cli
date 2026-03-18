import fs from "node:fs";
import path from "node:path";
import type { Generator } from "../../types.js";

export const biome: Generator = {
  name: "Biome",
  run: async (ctx) => {
    const pkgPath = path.join(ctx.projectDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "@biomejs/biome": "^1",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    const config = {
      $schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
      organizeImports: { enabled: true },
      linter: {
        enabled: true,
        rules: { recommended: true },
      },
      formatter: {
        indentStyle: "space",
        indentWidth: 2,
      },
    };
    const configPath = path.join(ctx.projectDir, "biome.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  },
};

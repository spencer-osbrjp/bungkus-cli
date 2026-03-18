import fs from "node:fs";
import path from "node:path";
import type { Generator } from "../../types.js";

export const prettier: Generator = {
  name: "Prettier",
  run: async (ctx) => {
    const pkgPath = path.join(ctx.projectDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.devDependencies = {
      ...pkg.devDependencies,
      prettier: "^3",
      "prettier-plugin-astro": "^0.14",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    const config = {
      plugins: ["prettier-plugin-astro"],
      overrides: [
        {
          files: "*.astro",
          options: { parser: "astro" },
        },
      ],
    };
    const configPath = path.join(ctx.projectDir, ".prettierrc");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  },
};

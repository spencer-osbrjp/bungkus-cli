import fs from "node:fs";
import path from "node:path";
import type { Generator } from "../../types.js";

export const eslint: Generator = {
  name: "ESLint",
  run: async (ctx) => {
    const pkgPath = path.join(ctx.projectDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.devDependencies = {
      ...pkg.devDependencies,
      eslint: "^9",
      "eslint-plugin-astro": "^1",
      "@typescript-eslint/parser": "^8",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    const configContent = `import eslintPluginAstro from "eslint-plugin-astro";

export default [
  ...eslintPluginAstro.configs.recommended,
];
`;
    const configPath = path.join(ctx.projectDir, "eslint.config.js");
    fs.writeFileSync(configPath, configContent);
  },
};

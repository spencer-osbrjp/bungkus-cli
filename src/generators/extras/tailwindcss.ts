import fs from "node:fs";
import path from "node:path";
import { builders, loadFile, writeFile } from "magicast";
import type { Generator } from "../../types.js";

export const tailwindcss: Generator = {
  name: "Tailwind CSS",
  run: async (ctx) => {
    const pkgPath = path.join(ctx.projectDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.devDependencies = {
      ...pkg.devDependencies,
      tailwindcss: "^4",
      "@astrojs/tailwind": "^6",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    const configPath = path.join(ctx.projectDir, "astro.config.mjs");
    const mod = await loadFile(configPath);
    mod.imports.$add({ from: "@astrojs/tailwind", local: "tailwind", imported: "default" });
    const config = mod.exports.default.$args[0];
    config.integrations ??= [];
    config.integrations.push(builders.functionCall("tailwind"));
    await writeFile(mod, configPath);

    const cssDir = path.join(ctx.projectDir, "src", "styles");
    fs.mkdirSync(cssDir, { recursive: true });
    fs.writeFileSync(
      path.join(cssDir, "global.css"),
      '@import "tailwindcss";\n',
    );
  },
};

import fs from "node:fs";
import path from "node:path";
import { builders, loadFile, writeFile } from "magicast";
import type { Generator } from "../../types.js";

export const wrangler: Generator = {
  name: "Wrangler",
  run: async (ctx) => {
    const pkgPath = path.join(ctx.projectDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.devDependencies = {
      ...pkg.devDependencies,
      wrangler: "^3",
      "@astrojs/cloudflare": "^12",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    const configPath = path.join(ctx.projectDir, "astro.config.mjs");
    const mod = await loadFile(configPath);
    mod.imports.$add({ from: "@astrojs/cloudflare", local: "cloudflare", imported: "default" });
    const config = mod.exports.default.$args[0];
    config.output = "server";
    config.adapter = builders.functionCall("cloudflare");
    await writeFile(mod, configPath);

    const toml = `name = "${ctx.projectName}"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"
`;
    fs.writeFileSync(path.join(ctx.projectDir, "wrangler.toml"), toml);
  },
};

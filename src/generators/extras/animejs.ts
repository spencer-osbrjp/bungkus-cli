import fs from "node:fs";
import path from "node:path";
import type { Generator } from "../../types.js";

export const animejs: Generator = {
  name: "Anime.js",
  run: async (ctx) => {
    const pkgPath = path.join(ctx.projectDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.dependencies = {
      ...pkg.dependencies,
      animejs: "^4",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  },
};

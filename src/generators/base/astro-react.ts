import fs from "node:fs";
import path from "node:path";
import { downloadTemplate } from "giget";
import type { Generator } from "../../types";

export const astroReact: Generator = {
  name: "Astro + React",
  run: async (ctx) => {
    await downloadTemplate("gh:withastro/astro/examples/framework-react", {
      dir: ctx.projectDir,
    });

    const pkgPath = path.join(ctx.projectDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.name = ctx.projectName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  },
};

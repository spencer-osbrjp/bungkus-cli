---
created_at: 2026-03-18T15:40:28+08:00
author: spencer.w@osbrjp.com
type: enhancement
layer: [Domain, Config]
effort:
commit_hash:
category:
---

# Implement config-file extras generators (Prettier, Biome, ESLint)

## Overview

Complete the TODO stubs in `src/generators/extras/` for the three config-file-based extras: Prettier, Biome, and ESLint. Each generator writes a config file to the project root and adds devDependencies to `package.json`. These generators do not need to modify `astro.config.mjs` and follow a uniform pattern: read package.json, add devDependencies, write package.json, write config file.

## Key Files

- `src/generators/extras/prettier.ts` - Prettier generator (TODO stub)
- `src/generators/extras/biome.ts` - Biome generator (TODO stub)
- `src/generators/extras/eslint.ts` - ESLint generator (TODO stub)
- `src/generators/extras/index.ts` - Registry mapping Extra keys to generators
- `src/types.ts` - Generator and GeneratorContext type definitions
- `src/generators/base/astro-default.ts` - Reference implementation showing package.json read/write pattern
- `src/scaffold.ts` - Orchestrator that calls extras sequentially after base generator

## Related History

This is an early-stage project with one prior ticket implementing the base generators using the same pattern of file I/O.

Past tickets that touched similar areas:

- [20260318153249-implement-base-generators.md](.workaholic/tickets/archive/drive-20260318-153304/20260318153249-implement-base-generators.md) - Implemented base generators with giget + package.json patching (same layer: Domain, same file I/O pattern)

## Implementation Steps

1. Create a shared helper function (e.g., `addDevDependencies(projectDir, deps)`) that reads `package.json`, merges new devDependencies, and writes it back. The base generators already duplicate this pattern three times, and all extras will need it too.
2. Implement `prettier.ts`:
   - Add `prettier` and `prettier-plugin-astro` as devDependencies
   - Write a `.prettierrc` config file with sensible Astro-aware defaults (e.g., enable the Astro plugin, set common options like singleQuote, semi)
3. Implement `biome.ts`:
   - Add `@biomejs/biome` as a devDependency
   - Write a `biome.json` config file with recommended defaults (organizeImports enabled, linter recommended rules, formatter settings)
4. Implement `eslint.ts`:
   - Add `eslint` and `eslint-plugin-astro` (and `@typescript-eslint/parser` if needed) as devDependencies
   - Write an `eslint.config.js` (flat config format) or `.eslintrc.cjs` with Astro plugin configured
5. Verify that each generator can run independently and the config files are valid for their respective tools.

## Patches

### `src/generators/extras/prettier.ts`

> **Note**: This patch is speculative - verify package versions and config options before applying.

```diff
--- a/src/generators/extras/prettier.ts
+++ b/src/generators/extras/prettier.ts
@@ -1,7 +1,27 @@
+import fs from "node:fs";
+import path from "node:path";
 import type { Generator } from "../../types.js";

 export const prettier: Generator = {
   name: "Prettier",
   run: async (ctx) => {
-    // TODO: add Prettier config
+    const pkgPath = path.join(ctx.projectDir, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
+    pkg.devDependencies = {
+      ...pkg.devDependencies,
+      prettier: "^3",
+      "prettier-plugin-astro": "^0.14",
+    };
+    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
+
+    const config = {
+      plugins: ["prettier-plugin-astro"],
+      overrides: [
+        {
+          files: "*.astro",
+          options: { parser: "astro" },
+        },
+      ],
+    };
+    const configPath = path.join(ctx.projectDir, ".prettierrc");
+    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
   },
 };
```

### `src/generators/extras/biome.ts`

> **Note**: This patch is speculative - verify package versions and config schema before applying.

```diff
--- a/src/generators/extras/biome.ts
+++ b/src/generators/extras/biome.ts
@@ -1,7 +1,28 @@
+import fs from "node:fs";
+import path from "node:path";
 import type { Generator } from "../../types.js";

 export const biome: Generator = {
   name: "Biome",
   run: async (ctx) => {
-    // TODO: add Biome config
+    const pkgPath = path.join(ctx.projectDir, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
+    pkg.devDependencies = {
+      ...pkg.devDependencies,
+      "@biomejs/biome": "^1",
+    };
+    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
+
+    const config = {
+      $schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
+      organizeImports: { enabled: true },
+      linter: {
+        enabled: true,
+        rules: { recommended: true },
+      },
+      formatter: {
+        indentStyle: "space",
+        indentWidth: 2,
+      },
+    };
+    const configPath = path.join(ctx.projectDir, "biome.json");
+    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
   },
 };
```

## Considerations

- Extract a shared `addDevDependencies` helper to avoid duplicating the package.json read/write/merge pattern across all generators (`src/generators/extras/prettier.ts`, `src/generators/extras/biome.ts`, `src/generators/extras/eslint.ts`)
- Prettier and ESLint overlap functionally with Biome; consider whether the CLI should warn if both Prettier+ESLint and Biome are selected simultaneously (`src/prompts.ts` lines 33-44)
- ESLint flat config (`eslint.config.js`) is the modern approach but some Astro plugins may still assume legacy `.eslintrc` format - verify compatibility (`src/generators/extras/eslint.ts`)
- Package versions in devDependencies should use ranges that are current at implementation time; the speculative patches use placeholder ranges (`src/generators/extras/`)
- The companion ticket for Tailwind CSS and Wrangler extras handles the more complex generators that require `astro.config.mjs` modification via magicast

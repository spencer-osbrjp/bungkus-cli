---
created_at: 2026-03-18T15:40:29+08:00
author: spencer.w@osbrjp.com
type: enhancement
layer: [Domain, Config]
effort: 0.5h
commit_hash: 9fc9a27
category: Added
---

# Implement Astro integration extras generators (Tailwind CSS, Wrangler)

## Overview

Complete the TODO stubs in `src/generators/extras/` for Tailwind CSS and Wrangler. Unlike the config-file extras (Prettier, Biome, ESLint), these generators must modify `astro.config.mjs` using magicast to add Astro integrations/adapters. Both require adding devDependencies to `package.json`, writing config files, and programmatically updating the Astro config's `integrations` or `output`/`adapter` fields.

## Key Files

- `src/generators/extras/tailwindcss.ts` - Tailwind CSS generator (TODO stub)
- `src/generators/extras/wrangler.ts` - Wrangler generator (TODO stub)
- `src/generators/extras/index.ts` - Registry mapping Extra keys to generators
- `src/types.ts` - Generator and GeneratorContext type definitions
- `src/scaffold.ts` - Orchestrator that calls extras sequentially after base generator
- `src/generators/base/astro-default.ts` - Reference for package.json patching pattern

## Related History

This is an early-stage project. The base generators ticket established the file I/O pattern for package.json modification. The companion config-file extras ticket covers the simpler generators.

Past tickets that touched similar areas:

- [20260318153249-implement-base-generators.md](.workaholic/tickets/archive/drive-20260318-153304/20260318153249-implement-base-generators.md) - Implemented base generators with giget + package.json patching (same layer: Domain)
- [20260318154028-implement-config-extras-generators.md](.workaholic/tickets/todo/20260318154028-implement-config-extras-generators.md) - Companion ticket for config-file extras (Prettier, Biome, ESLint)

## Implementation Steps

1. **Tailwind CSS generator** (`tailwindcss.ts`):
   - Add devDependencies: `tailwindcss`, `@astrojs/tailwind` (or `@tailwindcss/vite` depending on Tailwind v4 approach)
   - Use magicast to load `astro.config.mjs`, add `tailwind()` to the `integrations` array, and write it back
   - Write a `tailwind.config.mjs` with Astro content paths configured (or rely on Astro integration auto-config if using `@astrojs/tailwind`)
   - Create a base CSS file (e.g., `src/styles/global.css`) with Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) if needed for v3, or `@import "tailwindcss"` for v4

2. **Wrangler generator** (`wrangler.ts`):
   - Add devDependencies: `wrangler`, `@astrojs/cloudflare`
   - Use magicast to load `astro.config.mjs`, set `output: "server"` (or `"hybrid"`), and add `cloudflare()` as the adapter
   - Write a `wrangler.toml` config file with basic Cloudflare Pages/Workers settings (name from `ctx.projectName`, compatibility date, etc.)

3. Both generators should handle the case where `astro.config.mjs` already has an `integrations` array (append) or does not (create one).

## Patches

### `src/generators/extras/tailwindcss.ts`

> **Note**: This patch is speculative - the magicast API for manipulating astro.config.mjs integrations array needs verification. Tailwind v3 vs v4 approach also needs a decision.

```diff
--- a/src/generators/extras/tailwindcss.ts
+++ b/src/generators/extras/tailwindcss.ts
@@ -1,7 +1,28 @@
+import fs from "node:fs";
+import path from "node:path";
+import { loadFile, writeFile } from "magicast";
+import { addVitePlugin } from "magicast/helpers";
 import type { Generator } from "../../types.js";

 export const tailwindcss: Generator = {
   name: "Tailwind CSS",
   run: async (ctx) => {
-    // TODO: add Tailwind CSS integration
+    // Add devDependencies
+    const pkgPath = path.join(ctx.projectDir, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
+    pkg.devDependencies = {
+      ...pkg.devDependencies,
+      tailwindcss: "^4",
+      "@astrojs/tailwind": "^6",
+    };
+    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
+
+    // Modify astro.config.mjs to add tailwind integration
+    const configPath = path.join(ctx.projectDir, "astro.config.mjs");
+    const mod = await loadFile(configPath);
+    // TODO: add tailwind() to integrations array via magicast
+    // This requires careful handling of the AST - see magicast docs
+    await writeFile(mod, configPath);
   },
 };
```

### `src/generators/extras/wrangler.ts`

> **Note**: This patch is speculative - magicast API usage and wrangler.toml format need verification.

```diff
--- a/src/generators/extras/wrangler.ts
+++ b/src/generators/extras/wrangler.ts
@@ -1,7 +1,30 @@
+import fs from "node:fs";
+import path from "node:path";
+import { loadFile, writeFile } from "magicast";
 import type { Generator } from "../../types.js";

 export const wrangler: Generator = {
   name: "Wrangler",
   run: async (ctx) => {
-    // TODO: add Wrangler config
+    // Add devDependencies
+    const pkgPath = path.join(ctx.projectDir, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
+    pkg.devDependencies = {
+      ...pkg.devDependencies,
+      wrangler: "^3",
+      "@astrojs/cloudflare": "^12",
+    };
+    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
+
+    // Modify astro.config.mjs for Cloudflare adapter
+    const configPath = path.join(ctx.projectDir, "astro.config.mjs");
+    const mod = await loadFile(configPath);
+    // TODO: set output and adapter via magicast
+    await writeFile(mod, configPath);
+
+    // Write wrangler.toml
+    const toml = `name = "${ctx.projectName}"\ncompatibility_date = "2024-01-01"\npages_build_output_dir = "./dist"\n`;
+    fs.writeFileSync(path.join(ctx.projectDir, "wrangler.toml"), toml);
   },
 };
```

## Considerations

- The magicast library's API for adding imports and function calls to an existing config needs careful testing - specifically adding `import tailwind from '@astrojs/tailwind'` and pushing `tailwind()` to `integrations` array (`src/generators/extras/tailwindcss.ts`)
- Tailwind CSS v4 has a significantly different setup from v3 (no `tailwind.config.js`, uses `@import "tailwindcss"` in CSS, Vite plugin instead of PostCSS) - decide which version to target (`src/generators/extras/tailwindcss.ts`)
- The `@astrojs/cloudflare` adapter version and its config options change frequently; verify the latest stable API at implementation time (`src/generators/extras/wrangler.ts`)
- If both Tailwind and Wrangler are selected, magicast will modify `astro.config.mjs` twice sequentially; ensure the second write preserves changes from the first (`src/scaffold.ts` lines 32-39)
- Consider extracting a helper for the magicast load/modify/write pattern since both generators share it (`src/generators/extras/`)
- The config-file extras ticket (Prettier, Biome, ESLint) should be implemented first since it is simpler and establishes the devDependencies helper pattern that this ticket can reuse

## Final Report

### Changes Made
- `src/generators/extras/tailwindcss.ts` — Uses magicast to add tailwind() integration to astro.config.mjs, adds devDeps, creates src/styles/global.css with Tailwind v4 import
- `src/generators/extras/wrangler.ts` — Uses magicast to set output: "server" and adapter: cloudflare() in astro.config.mjs, adds devDeps, writes wrangler.toml

### Test Plan
- TypeScript type-check passes (tsc --noEmit)
- Both generators use magicast loadFile/writeFile for AST-safe config modification

### Release Prep
- No breaking changes. New functionality only — completes all extras generators.

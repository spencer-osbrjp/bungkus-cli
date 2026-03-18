---
created_at: 2026-03-18T15:32:49+08:00
author: spencer.w@osbrjp.com
type: enhancement
layer: [Domain]
effort:
commit_hash:
category:
---

# Implement base generators for Astro project scaffolding

## Overview

Complete the three TODO stubs in `src/generators/base/` so that each base generator uses `giget` (`downloadTemplate`) to clone the appropriate Astro starter template into the user's project directory. This is the core scaffolding functionality that everything else (extras, prompts, CLI) already wires up but currently does nothing.

## Key Files

- `src/generators/base/astro-default.ts` - Plain Astro scaffold (TODO stub)
- `src/generators/base/astro-react.ts` - Astro + React scaffold (TODO stub)
- `src/generators/base/astro-vue.ts` - Astro + Vue scaffold (TODO stub)
- `src/generators/base/index.ts` - Registry that maps `Base` keys to generators
- `src/types.ts` - `Generator`, `GeneratorContext`, `PackageManager` type definitions
- `src/scaffold.ts` - Orchestrator that calls `base.run(ctx)` then extras

## Related History

This is a greenfield project with only 2 commits (initial commit and base setup). No prior tickets exist.

## Implementation Steps

1. In `astro-default.ts`, import `downloadTemplate` from `giget` and call it with the official Astro starter template (e.g., `gh:withastro/astro/examples/basics`), targeting `ctx.projectDir`.
2. In `astro-react.ts`, do the same but use the Astro + React template (e.g., `gh:withastro/astro/examples/framework-react`).
3. In `astro-vue.ts`, do the same but use the Astro + Vue template (e.g., `gh:withastro/astro/examples/framework-vue`).
4. Update the `name` field in `package.json` of the downloaded template to match `ctx.projectName`. This can be done using `node:fs` to read/write the file, or via `magicast` if preferred for consistency with how extras might later modify config files.
5. Verify that the templates download correctly and the scaffold flow completes end-to-end.

## Patches

### `src/generators/base/astro-default.ts`

> **Note**: This patch is speculative - verify template path against the actual giget/Astro registry before applying.

```diff
--- a/src/generators/base/astro-default.ts
+++ b/src/generators/base/astro-default.ts
@@ -1,7 +1,16 @@
+import fs from "node:fs";
+import path from "node:path";
+import { downloadTemplate } from "giget";
 import type { Generator } from "../../types";

 export const astroDefault: Generator = {
   name: "Astro",
   run: async (ctx) => {
-    // TODO: scaffold base Astro project
+    await downloadTemplate("gh:withastro/astro/examples/basics", {
+      dir: ctx.projectDir,
+    });
+
+    const pkgPath = path.join(ctx.projectDir, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
+    pkg.name = ctx.projectName;
+    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
   },
 };
```

### `src/generators/base/astro-react.ts`

> **Note**: This patch is speculative - verify template path against the actual giget/Astro registry before applying.

```diff
--- a/src/generators/base/astro-react.ts
+++ b/src/generators/base/astro-react.ts
@@ -1,7 +1,16 @@
+import fs from "node:fs";
+import path from "node:path";
+import { downloadTemplate } from "giget";
 import type { Generator } from "../../types";

 export const astroReact: Generator = {
   name: "Astro + React",
   run: async (ctx) => {
-    // TODO: scaffold Astro + React project
+    await downloadTemplate("gh:withastro/astro/examples/framework-react", {
+      dir: ctx.projectDir,
+    });
+
+    const pkgPath = path.join(ctx.projectDir, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
+    pkg.name = ctx.projectName;
+    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
   },
 };
```

### `src/generators/base/astro-vue.ts`

> **Note**: This patch is speculative - verify template path against the actual giget/Astro registry before applying.

```diff
--- a/src/generators/base/astro-vue.ts
+++ b/src/generators/base/astro-vue.ts
@@ -1,7 +1,16 @@
+import fs from "node:fs";
+import path from "node:path";
+import { downloadTemplate } from "giget";
 import type { Generator } from "../../types";

 export const astroVue: Generator = {
   name: "Astro + Vue",
   run: async (ctx) => {
-    // TODO: scaffold Astro + Vue project
+    await downloadTemplate("gh:withastro/astro/examples/framework-vue", {
+      dir: ctx.projectDir,
+    });
+
+    const pkgPath = path.join(ctx.projectDir, "package.json");
+    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
+    pkg.name = ctx.projectName;
+    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
   },
 };
```

## Considerations

- The exact template paths for giget (`gh:withastro/astro/examples/basics`, etc.) should be verified against the current Astro monorepo structure, as example directory names may have changed (`src/generators/base/astro-default.ts`)
- Consider extracting a shared helper function (e.g., `downloadAndPatch`) to avoid duplicating the download + rename logic across all three files (`src/generators/base/`)
- The `downloadTemplate` call may fail if the target directory already exists; consider whether to handle this with a `force` option or pre-check (`src/scaffold.ts` lines 10-16)
- Error handling for network failures during template download should surface a user-friendly message via `@clack/prompts` rather than raw stack traces (`src/scaffold.ts` lines 27-29)
- Using synchronous `fs.readFileSync`/`writeFileSync` is acceptable for a CLI tool but could be swapped for async variants for consistency (`src/generators/base/astro-default.ts`)

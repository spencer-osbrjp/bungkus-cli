---
created_at: 2026-03-18T15:58:53+08:00
author: spencer.w@osbrjp.com
type: refactoring
layer: [UX, Domain]
effort:
commit_hash:
category:
---

# Restructure CLI prompts from single extras multiselect to distinct category prompts

## Overview

Replace the flat `extras` multiselect prompt with four dedicated sequential prompts: CSS framework, Formatter, Linter, and Deploy target. This improves UX by making choices clearer and enforcing constraints (e.g., Prettier and Biome are mutually exclusive). The `Extra` union type and `ScaffoldOptions.extras` array must be replaced with typed category fields. Generators themselves remain unchanged.

## Key Files

- `src/types.ts` - Defines `Extra` union type and `ScaffoldOptions` interface with flat `extras: Extra[]`
- `src/prompts.ts` - Contains the single `extras` multiselect prompt using `@clack/prompts`
- `src/scaffold.ts` - Orchestrator that iterates `options.extras` to run generators
- `src/generators/extras/index.ts` - Registry mapping `Extra` keys to `Generator` objects
- `src/cli.ts` - Entry point that wires prompts to scaffold (no changes needed, just context)

## Related History

All three prior tickets implemented the generators and scaffolding pipeline that this refactoring restructures. The prompt and type system was designed as a flat model; this ticket evolves it into categorized prompts.

Past tickets that touched similar areas:

- [20260318154028-implement-config-extras-generators.md](.workaholic/tickets/archive/drive-20260318-153304/20260318154028-implement-config-extras-generators.md) - Implemented Prettier, Biome, ESLint generators (same types: Extra, Generator)
- [20260318154029-implement-astro-integration-extras-generators.md](.workaholic/tickets/archive/drive-20260318-153304/20260318154029-implement-astro-integration-extras-generators.md) - Implemented Tailwind CSS, Wrangler generators (same types: Extra, Generator)
- [20260318153249-implement-base-generators.md](.workaholic/tickets/archive/drive-20260318-153304/20260318153249-implement-base-generators.md) - Implemented base generators and scaffold flow (same file: scaffold.ts)

## Implementation Steps

1. **Update `src/types.ts`**: Remove the `Extra` union type. Add new category types (`CssFramework`, `Formatter`, `Linter`, `DeployTarget`) as union types with `"none"` as a valid value. Replace `extras: Extra[]` in `ScaffoldOptions` with individual fields: `css`, `formatter`, `linter`, `deploy`.
2. **Update `src/prompts.ts`**: Replace the single `extras` multiselect with four sequential prompts inside `p.group()`:
   - `css`: `p.select()` with options Tailwind CSS or None
   - `formatter`: `p.select()` with options Prettier, Biome, or None (single choice, mutually exclusive)
   - `linter`: `p.select()` with options ESLint or None
   - `deploy`: `p.select()` with options Cloudflare (Wrangler) or None
3. **Update `src/generators/extras/index.ts`**: The flat `extraGenerators` record keyed by `Extra` can stay as-is or be reorganized. The key change is in how scaffold.ts looks up generators. Consider keeping the record but changing the key type, or splitting into per-category lookups.
4. **Update `src/scaffold.ts`**: Replace the `for (const extra of options.extras)` loop with individual conditional generator calls based on each category field. Run a generator only if the field is not `"none"`.

## Patches

### `src/types.ts`

```diff
--- a/src/types.ts
+++ b/src/types.ts
@@ -2,13 +2,17 @@ export type PackageManager = "npm" | "bun" | "pnpm";

 export type Base = "astro-default" | "astro-react" | "astro-vue";

-export type Extra =
-  | "tailwindcss"
-  | "prettier"
-  | "biome"
-  | "eslint"
-  | "wrangler";
+export type CssFramework = "tailwindcss" | "none";
+
+export type Formatter = "prettier" | "biome" | "none";
+
+export type Linter = "eslint" | "none";
+
+export type DeployTarget = "wrangler" | "none";

 export interface ScaffoldOptions {
   name: string;
   base: Base;
-  extras: Extra[];
+  css: CssFramework;
+  formatter: Formatter;
+  linter: Linter;
+  deploy: DeployTarget;
 }
```

### `src/prompts.ts`

```diff
--- a/src/prompts.ts
+++ b/src/prompts.ts
@@ -30,14 +30,36 @@ export async function runPrompts(
           ],
         }),

-      extras: () =>
-        p.multiselect({
-          message: "Select extras:",
+      css: () =>
+        p.select({
+          message: "Which CSS framework?",
+          options: [
+            { value: "tailwindcss", label: "Tailwind CSS" },
+            { value: "none", label: "None" },
+          ],
+        }),
+
+      formatter: () =>
+        p.select({
+          message: "Which formatter?",
+          options: [
+            { value: "prettier", label: "Prettier" },
+            { value: "biome", label: "Biome" },
+            { value: "none", label: "None" },
+          ],
+        }),
+
+      linter: () =>
+        p.select({
+          message: "Which linter?",
           options: [
-            { value: "tailwindcss", label: "Tailwind CSS" },
-            { value: "prettier", label: "Prettier" },
-            { value: "biome", label: "Biome" },
-            { value: "eslint", label: "ESLint" },
-            { value: "wrangler", label: "Wrangler (Cloudflare)" },
+            { value: "eslint", label: "ESLint" },
+            { value: "none", label: "None" },
+          ],
+        }),
+
+      deploy: () =>
+        p.select({
+          message: "Deploy target?",
+          options: [
+            { value: "wrangler", label: "Cloudflare (Wrangler)" },
+            { value: "none", label: "None" },
           ],
-          required: false,
         }),
     },
```

### `src/scaffold.ts`

```diff
--- a/src/scaffold.ts
+++ b/src/scaffold.ts
@@ -29,11 +29,17 @@ export async function scaffold(options: ScaffoldOptions) {
   s.stop(`${pc.green("✓")} Base template ready`);

-  // Run extra generators
-  for (const extra of options.extras) {
-    const generator = extraGenerators[extra];
-    if (!generator) continue;
-
-    s.start(`Setting up ${pc.cyan(generator.name)}...`);
-    await generator.run(ctx);
-    s.stop(`${pc.green("✓")} ${generator.name} configured`);
+  // Run category generators
+  const selections = [
+    options.css,
+    options.formatter,
+    options.linter,
+    options.deploy,
+  ] as const;
+
+  for (const key of selections) {
+    if (key !== "none") {
+      const generator = extraGenerators[key];
+      s.start(`Setting up ${pc.cyan(generator.name)}...`);
+      await generator.run(ctx);
+      s.stop(`${pc.green("✓")} ${generator.name} configured`);
+    }
   }
```

### `src/generators/extras/index.ts`

> **Note**: This patch is speculative - the key type needs to align with whatever approach is chosen for the record type.

```diff
--- a/src/generators/extras/index.ts
+++ b/src/generators/extras/index.ts
@@ -1,4 +1,4 @@
-import type { Extra, Generator } from "../../types";
+import type { Generator } from "../../types";
 import { tailwindcss } from "./tailwindcss";
 import { prettier } from "./prettier";
 import { biome } from "./biome";
@@ -6,7 +6,7 @@ import { eslint } from "./eslint";
 import { wrangler } from "./wrangler";

-export const extraGenerators: Record<Extra, Generator> = {
+export const extraGenerators: Record<string, Generator> = {
   tailwindcss,
   prettier,
   biome,
```

## Considerations

- The `extraGenerators` record key type changes from `Extra` to a broader type since the `Extra` union is removed. Consider creating a union of all non-`"none"` category values (e.g., `type ExtraKey = "tailwindcss" | "prettier" | "biome" | "eslint" | "wrangler"`) to maintain type safety instead of using `Record<string, Generator>` (`src/generators/extras/index.ts`)
- The `p.group()` call in prompts.ts returns an object whose shape must match `ScaffoldOptions`; verify that `p.select()` return types are correctly inferred or cast (`src/prompts.ts` lines 10-52)
- The current `return options as ScaffoldOptions` cast in prompts.ts will need the new fields to be present in the group result (`src/prompts.ts` line 54)
- If Biome is selected as formatter, users might still want ESLint for rules Biome does not cover; consider whether to note this in the prompt or leave it as independent choices (`src/prompts.ts`)
- The `"none"` values never reach generators since scaffold.ts filters them out, but they flow through the type system; ensure no downstream code assumes all `ScaffoldOptions` fields map to generator keys (`src/scaffold.ts` lines 29-45)

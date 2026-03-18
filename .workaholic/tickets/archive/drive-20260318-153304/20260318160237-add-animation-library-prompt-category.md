---
created_at: 2026-03-18T16:02:37+08:00
author: spencer.w@osbrjp.com
type: enhancement
layer: [UX, Domain]
effort: 0.25h
commit_hash: 90644ee
category: Added
---

# Add animation library prompt category to CLI

## Overview

Add a new "Animation" category select prompt to the CLI, following the same pattern introduced by the restructure ticket. Users will choose one animation library from Motion (motion.dev), GSAP, Anime.js, or None. Each non-none option gets a generator that adds the appropriate npm dependency to package.json.

## Key Files

- `src/types.ts` - Add `AnimationLibrary` type and `animation` field to `ScaffoldOptions`
- `src/prompts.ts` - Add animation select prompt to `p.group()` call
- `src/scaffold.ts` - Include `options.animation` in the selections array
- `src/generators/extras/index.ts` - Register animation generators in the record
- `src/generators/extras/motion.ts` - New generator for Motion (motion.dev)
- `src/generators/extras/gsap.ts` - New generator for GSAP
- `src/generators/extras/animejs.ts` - New generator for Anime.js

## Related History

The codebase was recently built with a flat extras multiselect model. A pending restructure ticket converts that into per-category select prompts, which is the prerequisite pattern this ticket extends with a new Animation category.

Past tickets that touched similar areas:

- [20260318155853-restructure-cli-prompts-categories.md](.workaholic/tickets/todo/20260318155853-restructure-cli-prompts-categories.md) - Restructures flat extras into category prompts (direct dependency, establishes the pattern)
- [20260318154028-implement-config-extras-generators.md](.workaholic/tickets/archive/drive-20260318-153304/20260318154028-implement-config-extras-generators.md) - Implemented Prettier, Biome, ESLint generators (same generator pattern)
- [20260318154029-implement-astro-integration-extras-generators.md](.workaholic/tickets/archive/drive-20260318-153304/20260318154029-implement-astro-integration-extras-generators.md) - Implemented Tailwind CSS, Wrangler generators (same generator pattern)

## Implementation Steps

1. **Update `src/types.ts`**: Add `AnimationLibrary` type as `"motion" | "gsap" | "animejs" | "none"`. Add `animation: AnimationLibrary` field to `ScaffoldOptions`.
2. **Create `src/generators/extras/motion.ts`**: Generator that reads package.json, adds `"motion": "^12"` to dependencies, and writes it back. No config file needed.
3. **Create `src/generators/extras/gsap.ts`**: Generator that reads package.json, adds `"gsap": "^3"` to dependencies, and writes it back.
4. **Create `src/generators/extras/animejs.ts`**: Generator that reads package.json, adds `"animejs": "^4"` to dependencies, and writes it back.
5. **Update `src/generators/extras/index.ts`**: Import the three new generators and add entries for `motion`, `gsap`, and `animejs` to the `extraGenerators` record.
6. **Update `src/prompts.ts`**: Add an `animation` select prompt to `p.group()` with options: Motion (motion.dev), GSAP, Anime.js, None.
7. **Update `src/scaffold.ts`**: Add `options.animation` to the selections array so it is included in the generator loop.

## Patches

> **Note**: These patches assume the restructure ticket (20260318155853) has already been applied. The base code shown reflects the post-restructure state.

### `src/types.ts`

```diff
--- a/src/types.ts
+++ b/src/types.ts
@@ -8,10 +8,13 @@ export type Linter = "eslint" | "none";

 export type DeployTarget = "wrangler" | "none";

+export type AnimationLibrary = "motion" | "gsap" | "animejs" | "none";
+
 export interface ScaffoldOptions {
   name: string;
   base: Base;
   css: CssFramework;
   formatter: Formatter;
   linter: Linter;
   deploy: DeployTarget;
+  animation: AnimationLibrary;
 }
```

### `src/prompts.ts`

> **Note**: This patch is speculative - exact line numbers depend on the restructure ticket's final output.

```diff
--- a/src/prompts.ts
+++ b/src/prompts.ts
@@ -60,6 +60,17 @@ export async function runPrompts(
           ],
         }),

+      animation: () =>
+        p.select({
+          message: "Which animation library?",
+          options: [
+            { value: "motion", label: "Motion (motion.dev)" },
+            { value: "gsap", label: "GSAP" },
+            { value: "animejs", label: "Anime.js" },
+            { value: "none", label: "None" },
+          ],
+        }),
+
     },
```

### `src/scaffold.ts`

> **Note**: This patch is speculative - exact line numbers depend on the restructure ticket's final output.

```diff
--- a/src/scaffold.ts
+++ b/src/scaffold.ts
@@ -33,6 +33,7 @@ export async function scaffold(options: ScaffoldOptions) {
     options.formatter,
     options.linter,
     options.deploy,
+    options.animation,
   ] as const;
```

## Considerations

- This ticket depends on the restructure ticket (20260318155853) being implemented first; the patches assume the post-restructure code shape (`src/types.ts`, `src/prompts.ts`, `src/scaffold.ts`)
- GSAP has a commercial license for some features; the generator only adds the free npm package but users should be aware of licensing terms (consider adding a note in the prompt label or not)
- The `extraGenerators` record key type must include the new animation values; if the restructure ticket uses `Record<string, Generator>` this works automatically, but if it uses a union type it must be extended (`src/generators/extras/index.ts`)
- Motion (motion.dev) was formerly called Framer Motion; the npm package is `motion` (not `framer-motion`) as of the rename (`src/generators/extras/motion.ts`)
- Anime.js v4 uses the `animejs` npm package name; verify the correct package name and version at implementation time (`src/generators/extras/animejs.ts`)
- The animation generators only add dependencies to package.json without creating config files, which is simpler than generators like Tailwind CSS or Prettier; this is intentional since animation libraries typically need no project-level configuration (`src/generators/extras/`)

## Final Report

### Changes Made
- `src/generators/extras/motion.ts` — New generator adding motion ^12 to dependencies
- `src/generators/extras/gsap.ts` — New generator adding gsap ^3 to dependencies
- `src/generators/extras/animejs.ts` — New generator adding animejs ^4 to dependencies
- `src/types.ts` — Added AnimationLibrary type, extended ExtraKey, added animation field
- `src/prompts.ts` — Added animation select prompt
- `src/scaffold.ts` — Added options.animation to selections
- `src/generators/extras/index.ts` — Registered 3 new generators

### Test Plan
- TypeScript type-check passes (tsc --noEmit)

### Release Prep
- No breaking changes. New feature adding animation library selection.

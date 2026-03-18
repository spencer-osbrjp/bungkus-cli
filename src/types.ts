export type PackageManager = "npm" | "bun" | "pnpm";

export type Base = "astro-default" | "astro-react" | "astro-vue";

export type CssFramework = "tailwindcss" | "none";

export type Formatter = "prettier" | "biome" | "none";

export type Linter = "eslint" | "none";

export type DeployTarget = "wrangler" | "none";

export type AnimationLibrary = "motion" | "gsap" | "animejs" | "none";

export type ExtraKey = "tailwindcss" | "prettier" | "biome" | "eslint" | "wrangler" | "motion" | "gsap" | "animejs";

export interface ScaffoldOptions {
  name: string;
  base: Base;
  css: CssFramework;
  formatter: Formatter;
  linter: Linter;
  deploy: DeployTarget;
  animation: AnimationLibrary;
}

export interface Generator {
  name: string;
  run: (ctx: GeneratorContext) => Promise<void>;
}

export interface GeneratorContext {
  projectDir: string;
  projectName: string;
  packageManager: PackageManager;
}

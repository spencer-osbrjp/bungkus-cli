export type PackageManager = "npm" | "bun" | "pnpm";

export type Base = "astro-default" | "astro-react" | "astro-vue";

export type Extra =
  | "tailwindcss"
  | "prettier"
  | "biome"
  | "eslint"
  | "wrangler";

export interface ScaffoldOptions {
  name: string;
  base: Base;
  extras: Extra[];
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

import type { ExtraKey, Generator } from "../../types";
import { tailwindcss } from "./tailwindcss";
import { prettier } from "./prettier";
import { biome } from "./biome";
import { eslint } from "./eslint";
import { wrangler } from "./wrangler";

export const extraGenerators: Record<ExtraKey, Generator> = {
  tailwindcss,
  prettier,
  biome,
  eslint,
  wrangler,
};

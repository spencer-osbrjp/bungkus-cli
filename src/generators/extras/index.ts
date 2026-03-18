import type { Extra, Generator } from "../../types";
import { tailwindcss } from "./tailwindcss";
import { prettier } from "./prettier";
import { biome } from "./biome";
import { eslint } from "./eslint";
import { wrangler } from "./wrangler";

export const extraGenerators: Record<Extra, Generator> = {
  tailwindcss,
  prettier,
  biome,
  eslint,
  wrangler,
};

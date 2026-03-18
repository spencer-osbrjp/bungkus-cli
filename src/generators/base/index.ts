import type { Base, Generator } from "../../types";
import { astroDefault } from "./astro-default";
import { astroReact } from "./astro-react";
import { astroVue } from "./astro-vue";

export const baseGenerators: Record<Base, Generator> = {
  "astro-default": astroDefault,
  "astro-react": astroReact,
  "astro-vue": astroVue,
};

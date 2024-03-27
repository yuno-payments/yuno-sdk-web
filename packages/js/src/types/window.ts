import { Yuno } from "./yuno";

export type WindowInstance = Window &
  typeof globalThis & { Yuno: Yuno | undefined };

import { type Options, defineConfig } from "tsup";

const config = {
  entry: ["./src/index.ts", "./src/types.ts"],
  dts: true,
  format: ["esm", "cjs"],
} satisfies Options;

export default defineConfig(() => config);

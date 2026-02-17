import { defineConfig } from "tsup";

export default defineConfig([
  // Main library
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    minify: false,
    target: "node18",
  },
  // CLI entry point
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    dts: false,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    minify: false,
    target: "node18",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);

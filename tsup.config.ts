import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/lib/index.ts"],
  format: ["esm"],
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: "esnext",
  external: ["react", "react-dom", "react/jsx-runtime"],
});

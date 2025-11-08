import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "./src/index.js",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
      },
      {
        file: "dist/index.esm.js",
        format: "es",
        exports: "named",
      },
    ],
    plugins: [external(), resolve({ extensions: [".js"] }), terser()],
  },
];

import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
	input: "./src/main.ts",
	output: {
		file: "./dist/bundle.js",
		format: "cjs",
	},
	plugins: [
		json(),
		typescript({ tsconfig: "./tsconfig.json" }),
		commonjs({ extensions: [".js", ".ts"] }),
	],
};

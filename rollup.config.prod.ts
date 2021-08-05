import fs from "fs";
import * as path from "path";

import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";

const distributionPath = path.resolve(__dirname, "dist");

if (process.version >= "v14.4") {
	fs.rmSync(distributionPath, {
		recursive: true,
		force: true,
	});
} else {
	fs.rmdirSync(distributionPath, {
		recursive: true,
	});
}

export default {
	input: "./src/main.ts",
	output: {
		file: "./dist/main.js",
		format: "cjs",
	},
	plugins: [
		json(),
		typescript({ tsconfig: "./tsconfig.json" }),
		commonjs({ extensions: [".js", ".ts"] }),
		uglify(),
	],
};

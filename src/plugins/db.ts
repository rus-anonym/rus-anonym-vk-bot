import fs from "fs";
import { config } from "./core";
export const DB = {
	messages: {
		exist: async function (messageID: number) {
			return fs.existsSync(`../DB/messages/${messageID}.json`);
		},
		get: async function (messageID: number) {
			return fs.readFileSync(`../DB/messages/${messageID}.json`);
		},
		save: async function (messageID: number, data: JSON) {
			return fs.writeFileSync(
				`../DB/messages/${messageID}.json`,
				JSON.stringify(data),
			);
		},
		delete: async function (messageID: number) {
			return fs.unlinkSync(`../DB/messages/${messageID}.json`);
		},
	},
	config: {
		save: async function () {
			return fs.writeFileSync(
				`../DB/config.json`,
				JSON.stringify(config, null, `\t`),
			);
		},
	},
};

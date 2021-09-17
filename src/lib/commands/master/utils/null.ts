import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands/core";

const templates = ["всмысле"];

new UserCommand({
		regexp: new RegExp(`(${templates.join("|")})$`, "i"), process: () => {
			return new Promise((resolve) => resolve(null));
		}
	});

new UserCommand({
		regexp: new RegExp(utils.regular.list.email, "i"), process: () => {
			return new Promise((resolve) => resolve(null));
		}
	});

new UserCommand({
		regexp: new RegExp(utils.regular.list.url, "i"), process: () => {
			return new Promise((resolve) => resolve(null));
		}
	});

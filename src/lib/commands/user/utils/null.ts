import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands/core";

const templates = ["всмысле"];

new UserCommand(new RegExp(`(${templates.join("|")})$`, "i"), () => {
	return new Promise((resolve) => resolve(null));
});

new UserCommand(new RegExp(utils.regular.list.email, "i"), () => {
	return new Promise((resolve) => resolve(null));
});

new UserCommand(new RegExp(utils.regular.list.url, "i"), () => {
	return new Promise((resolve) => resolve(null));
});

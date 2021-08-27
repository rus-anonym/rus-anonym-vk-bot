import { UserCommand } from "../../../utils/lib/commands/core";

const templates = ["всмысле"];

new UserCommand(new RegExp(`(${templates.join("|")})$`, "i"), () => {
	return new Promise((resolve) => resolve(null));
});

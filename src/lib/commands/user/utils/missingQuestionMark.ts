import { UserCommand } from "../../../utils/lib/commands/core";

const templates = ["что", "всм"];

new UserCommand(new RegExp(`(${templates.join("|")})$`, "i"), (message) => {
	return message.editMessage({
		message: message.text + "?",
	});
});
 
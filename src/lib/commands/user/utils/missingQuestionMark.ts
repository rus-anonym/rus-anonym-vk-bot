import { UserCommand } from "../../../utils/lib/commands/core";

const templates = ["что", "всм", "поч", "почему"];

new UserCommand(new RegExp(`(${templates.join("|")})$`, "i"), (message) => {
	return message.editMessage({
		message: message.text + "?",
	});
});

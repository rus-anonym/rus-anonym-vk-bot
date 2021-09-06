import { UserCommand } from "../../../utils/lib/commands/core";

const question = ["что", "всм", "поч", "почему"];
const exlamation = ["пизда"];

new UserCommand(new RegExp(`(${question.join("|")})$`, "i"), (message) => {
	return message.editMessage({
		message: message.text + "?",
	});
});

new UserCommand(new RegExp(`(${exlamation.join("|")})$`, "i"), (message) => {
	return message.editMessage({
		message: message.text + "!",
	});
});

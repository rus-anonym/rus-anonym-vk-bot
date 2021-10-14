import utils from "rus-anonym-utils";
import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand({
	regexp: /(?:^!выбери\s)(.*)(?:\sили\s)(.*)$/i,
	process: async function (message) {
		return await message.reply(
			`Я выбираю ${
				message.state.args[utils.number.getRandomIntInclusive(0, 1) + 1]
			}`,
		);
	},
});

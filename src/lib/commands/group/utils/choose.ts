import utils from "rus-anonym-utils";
import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand(/(?:^выбери\s)(.*)(?:\sили\s)(.*)$/i, async function (
	message,
) {
	return await message.state.sendMessage(
		`Я выбираю ${
			message.state.args[utils.number.getRandomIntInclusive(0, 1) + 1]
		}`,
	);
});

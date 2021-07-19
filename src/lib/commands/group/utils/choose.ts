import utils from "rus-anonym-utils";
import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand(/(?:^выбери\s)(.*)(?:\sили\s)(.*)$/i, async function (
	message,
) {
	return await message.sendMessage(
		`Я выбираю ${message.args[utils.number.getRandomIntInclusive(0, 1) + 1]}`,
	);
});

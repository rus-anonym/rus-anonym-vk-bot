import utils from "rus-anonym-utils";
import { Command } from "../../../utils/lib/command";

new Command(/(?:^!выбери\s)(.*)(?:\sили\s)(.*)$/i, async function (message) {
	return await message.reply(
		`Я выбираю ${message.args[utils.number.getRandomInt(0, 1) + 1]}`,
	);
});

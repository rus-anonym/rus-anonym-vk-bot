import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand({
		regexp: /^zz ((?:.|\s)+)$/i, process: async function (message) {
			if (!message.state.args[1]) {
				return message.reply(`нет кода`);
			}
			await message.loadMessagePayload();
			try {
				const answer: string | number | JSON = await eval(message.state.args[1]);
				const type = utils.typeof(answer);
				if (type === "object" || type === "array") {
					return await message.reply(
						`Type: ${type}
JSON Stringify: ${JSON.stringify(answer, null, "　\t")}`,
						{
							disable_mentions: true,
							dont_parse_links: true,
						});
				} else {
					return await message.reply(
						`Type: ${type}
Значение: ${answer}`,
						{
							disable_mentions: true,
							dont_parse_links: true,
						});
				}
			} catch (err) {
				return await message.reply(`${err.toString()}`, {
					disable_mentions: true,
					dont_parse_links: true,
				});
			}
		}
	});

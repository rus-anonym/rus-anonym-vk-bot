import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands/core";
import DB from "../../../DB/core";

const asyncFunctionConstructor = Object.getPrototypeOf(async function () {
	//
}).constructor;

const asyncEval = async (code: string, params: Record<string, unknown>) => {
	if (!code.includes("return")) {
		code = "return " + code;
	}

	code = `const { DB, api, tmp, message, utils } = _params;\n` + code;

	return await asyncFunctionConstructor(`_params`, code).call(this, params);
};

new UserCommand({
	regexp: /^zz ((?:.|\s)+)$/i,
	process: async function (message, vk) {
		if (!message.state.args[1]) {
			return message.reply(`нет кода`);
		}
		await message.loadMessagePayload();
		try {
			const answer: string | number | JSON = await asyncEval(
				message.state.args[1],
				{
					DB,
					utils,
					message,
					api: vk.api,
					tmp: DB.temp.user.master.eval,
				},
			);
			const type = utils.typeof(answer);
			let response: string;
			if (type === "object" || type === "array") {
				response = `Type: ${type}
JSON Stringify: ${JSON.stringify(answer, null, "　\t")}`;
			} else {
				response = `Type: ${type}
Значение: ${answer}`;
			}
			return await message.reply(response, {
				disable_mentions: true,
				dont_parse_links: true,
			});
		} catch (err) {
			return await message.reply(`${err.toString()}`, {
				disable_mentions: true,
				dont_parse_links: true,
			});
		}
	},
});

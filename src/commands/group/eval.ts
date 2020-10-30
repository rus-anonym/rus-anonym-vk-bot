import { ModernUserMessageContext } from "./../../plugins/types";
import { config } from "../../plugins/core";
export = {
	regexp: /^(?:zz)\s([^]+)$/i,
	process: async function (message: ModernUserMessageContext) {
		if (message.senderId !== config.vk.user.id) {
			return;
		}
		try {
			const result = eval(message.args[1]);

			if (typeof result === "string") {
				return await message.send(`Результат: ${result}`);
			} else if (typeof result === "number") {
				return await message.send(`Значение: ${result}`);
			} else {
				return await message.send(
					`JSON Stringify: ${JSON.stringify(result, null, "　\t")}`,
				);
			}
		} catch (error) {
			return await message.send(`Ошибка: ${error.toString()}`);
		}
	},
};

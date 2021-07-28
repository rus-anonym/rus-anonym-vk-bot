import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand({
		regexp: /(?:^!eval)(\s(.*))?$/i, process: async function (message) {
			if (message.senderId !== 266982306 || !message.state.args[1]) {
				return;
			}
			try {
				const answer: string | number | JSON = await eval(message.state.args[1]);
				if (typeof answer === "string") {
					return await message.state.sendMessage(`Результат: ${answer}`);
				} else if (typeof answer === "number") {
					return await message.state.sendMessage(`Значение: ${answer}`);
				} else {
					return await message.state.sendMessage(
						`JSON Stringify: ${JSON.stringify(answer, null, "　\t")}`
					);
				}
			} catch (err) {
				return await message.state.sendMessage(`Ошибка: ${err.toString()}`);
			}
		}
	});

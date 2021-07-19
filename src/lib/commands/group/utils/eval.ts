import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand(/(?:^!eval)(\s(.*))?$/i, async function (message) {
	if (message.senderId !== 266982306 || !message.args[1]) {
		return;
	}
	try {
		const answer: string | number | JSON = await eval(message.args[1]);
		if (typeof answer === "string") {
			return await message.sendMessage(`Результат: ${answer}`);
		} else if (typeof answer === "number") {
			return await message.sendMessage(`Значение: ${answer}`);
		} else {
			return await message.sendMessage(
				`JSON Stringify: ${JSON.stringify(answer, null, "　\t")}`,
			);
		}
	} catch (err) {
		return await message.sendMessage(`Ошибка: ${err.toString()}`);
	}
});

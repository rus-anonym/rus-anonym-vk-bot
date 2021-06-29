import { UserCommand } from "../../../utils/lib/commands";

new UserCommand(/(?:^!zz)(\s(.*))?$/i, async function (message) {
	if (!message.args[1]) {
		return message.send(`нет кода`);
	}
	try {
		const answer: string | number | JSON = await eval(message.args[1]);
		if (typeof answer === "string") {
			return await message.send(`Результат: ${answer}`);
		} else if (typeof answer === "number") {
			return await message.send(`Значение: ${answer}`);
		} else {
			return await message.send(
				`JSON Stringify: ${JSON.stringify(answer, null, "　\t")}`,
			);
		}
	} catch (err) {
		return await message.send(`Ошибка: ${err.toString()}`);
	}
});

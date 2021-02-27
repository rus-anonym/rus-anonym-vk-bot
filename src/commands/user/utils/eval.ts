import ICommand from "../../../types/interfaces/commands";

const command: ICommand = {
	regexp: [/(?:^!zz)(\s(.*))?$/i, /(?:^!eval)(\s(.*))?$/i],
	process: async function (message, vk) {
		if (!message.args[1]) {
			return message.send(`нет аргумента`);
		}
		vk;
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
	},
};

export default command;

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!zz)(\s(.*))?$/i, async function (message) {
	if (!message.state.args[1]) {
		return message.reply(`нет кода`);
	}
	await message.loadMessagePayload();
	try {
		const answer: string | number | JSON = await eval(message.state.args[1]);
		if (typeof answer === "string") {
			return await message.reply(`Результат: ${answer}`, {
				disable_mentions: true,
				dont_parse_links: true,
			});
		} else if (typeof answer === "number") {
			return await message.reply(`Значение: ${answer}`, {
				disable_mentions: true,
				dont_parse_links: true,
			});
		} else {
			return await message.reply(
				`JSON Stringify: ${JSON.stringify(answer, null, "　\t")}`,
				{
					disable_mentions: true,
					dont_parse_links: true,
				},
			);
		}
	} catch (err) {
		return await message.reply(`Ошибка: ${err.toString()}`, {
			disable_mentions: true,
			dont_parse_links: true,
		});
	}
});

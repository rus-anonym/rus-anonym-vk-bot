import { GroupCommand } from "../../../utils/lib/commands";

new GroupCommand(/(?:^!ник)(\s(.*))?$/i, async function (message) {
	if (!message.args[1]) {
		return message.sendMessage(`Вы не указали новый ник`);
	}
	if (message.args[1].length > 20) {
		return message.sendMessage(`Максимальная длина ника 20 символов`);
	}
	message.user.nickname = message.args[1].trim();
	await message.user.save();
	return await message.sendMessage(
		`Вы поменяли свой ник на ${message.user.nickname}`,
	);
});

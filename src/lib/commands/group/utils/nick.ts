import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand(/(?:^!ник)(\s(.*))?$/i, async function (message) {
	if (!message.state.args[1]) {
		return message.state.sendMessage(`Вы не указали новый ник`);
	}
	if (message.state.args[1].length > 20) {
		return message.state.sendMessage(`Максимальная длина ника 20 символов`);
	}
	message.state.user.nickname = message.state.args[1].trim();
	await message.state.user.save();
	return await message.state.sendMessage(
		`Вы поменяли свой ник на ${message.state.user.nickname}`,
	);
});

import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtils from "../../../../utils/core";

new UserCommand({
	regexp: /(?:^!regGroup)(?:\s(.*))?$/i,
	process: async function (message) {
		await message.loadMessagePayload();
		const groupName = message.state.args[1] || "Reserve group";
		const groupId = await InternalUtils.user.reserveScreenName(groupName);
		return message.reply(`Зарегистрирована группа @club${groupId}`);
	},
});

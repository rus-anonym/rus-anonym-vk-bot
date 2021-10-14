import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtils from "../../../../utils/core";

new UserCommand({
	regexp: /(?:^!reserve)(?:\s(.*))?$/i,
	process: async function (message) {
		await message.loadMessagePayload();
		let screenName: string | undefined = undefined;
		if (!message.state.args[1]) {
			if (message.replyMessage && message.replyMessage.text) {
				message.replyMessage.text = message.replyMessage.text.replace(/@/g, "");
				const match = message.replyMessage.text.match(/\[id\d+\|(.*)\]/);
				if (match && match[1]) {
					screenName = match[1];
				} else {
					screenName = message.replyMessage.text?.replace("@", "");
				}
			}
		} else {
			screenName = message.state.args[1];
		}
		if (screenName === undefined) {
			return message.editMessage({ message: "Не выбран домен" });
		}
		try {
			await InternalUtils.user.reserveScreenName(screenName);
			return await message.editMessage({
				message: `@${screenName} зарезервирован`,
			});
		} catch (error) {
			return await message.editMessage({
				message: `Ошибка: ${error.toString()}`,
			});
		}
	},
});

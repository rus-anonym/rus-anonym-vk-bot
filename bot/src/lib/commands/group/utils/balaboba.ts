import utils from "rus-anonym-utils";

import { GroupCommand } from "../../../utils/lib/commands/core";

import VK from "../../../VK/core";
import InternalUtils from "../../../utils/core";

new GroupCommand({
	regexp: /(?:^\/ии)(\s(.*))?$/i,
	process: async function (message) {
		let oldText;
		if (!message.state.args[1]) {
			if (message.replyMessage && message.replyMessage.text) {
				oldText = message.replyMessage.text.replace(
					/(?:\n\nMS: (?:\d+.\d+))/,
					"",
				);
			} else {
				let userID;
				try {
					userID = await InternalUtils.userCommands.getUserId(
						message,
						message.state.args[1],
					);
				} catch (error) {
					return await message.editMessage({
						message: error.message,
					});
				}
				const [user] = await VK.group.getAPI().users.get({
					user_ids: userID.toString(),
				});
				oldText = `${user.first_name} ${user.last_name} это`;
			}
		} else {
			oldText = message.state.args[1];
		}
		try {
			const { text, ms } = await utils.yandex.balaboba.generate(oldText.trim());
			return await message.state.sendMessage({
				message: text + `\n\nMS: ${ms}`,
				disable_mentions: true,
				dont_parse_links: true,
			});
		} catch (err) {
			return await message.state.sendMessage({
				message: `Balaboba API Error (${err.message})`,
			});
		}
	},
});

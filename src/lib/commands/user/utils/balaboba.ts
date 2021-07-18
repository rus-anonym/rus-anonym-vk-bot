import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands";

import VK from "../../../VK/core";
import InternalUtils from "../../../utils/core";

new UserCommand(/(?:^!ии)(\s(.*))?$/i, async function (message) {
	let oldText;
	let isContinue = false;
	if (!message.args[1]) {
		await message.loadMessagePayload();
		if (message.replyMessage && message.replyMessage.text) {
			oldText = message.replyMessage.text.replace(
				/(?:\n\nMS: (?:\d+.\d+))/,
				"",
			);
			isContinue = true;
		} else {
			let userID;
			try {
				userID = await InternalUtils.userCommands.getUserId(message);
			} catch (error) {
				return await message.editMessage({
					message: error.message,
				});
			}
			const [user] = await VK.group.getVK().api.users.get({
				user_ids: userID.toString(),
			});
			oldText = `${user.first_name} ${user.last_name} это`;
		}
	} else {
		oldText = message.args[1];
		isContinue = true;
	}
	try {
		const { response, text, ms } = await utils.yandex.balaboba.generate(
			oldText.trim(),
		);
		return await message.editMessage({
			message: isContinue ? response : text + `\n\nMS: ${ms}`,
			disable_mentions: true,
			dont_parse_links: true,
		});
	} catch (err) {
		return await message.editMessage({
			message: `Balaboba API Error (${err.message})`,
		});
	}
});

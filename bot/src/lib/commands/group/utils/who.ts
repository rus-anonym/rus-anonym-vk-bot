import utils from "rus-anonym-utils";

import VK from "../../../VK/core";
import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand({
	regexp: /(?:^кто\s)(.*)$/i,
	process: async function (message) {
		if (!message.isChat) {
			return await message.editMessage({
				message: `Работает только в чатах`,
			});
		}

		if (message.state.args[1].endsWith("?")) {
			message.state.args[1] = message.state.args[1].substring(
				0,
				message.state.args[1].length - 1,
			);
		}

		const users = await VK.group.getAPI().messages.getConversationMembers({
			peer_id: message.peerId,
		});

		const randomUser = utils.array.random(
			users.items.filter((x) => x.member_id > 0),
		).member_id;

		const [userData] = await VK.group
			.getVK()
			.api.users.get({ user_ids: randomUser.toString() });

		return await message.state.sendMessage({
			message: `Мне кажется что ${message.state.args[1]} это @id${userData?.id} (${userData?.first_name} ${userData?.last_name})`,
			disable_mentions: true,
		});
	},
});

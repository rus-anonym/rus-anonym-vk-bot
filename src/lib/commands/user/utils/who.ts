import utils from "rus-anonym-utils";

import VK from "../../../VK/core";
import { UserCommand } from "../../../utils/lib/commands";

new UserCommand(/(?:^!кто\s)(.*)$/i, async function (message) {
	if (!message.isChat) {
		return await message.editMessage({
			message: `Работает только в чатах`,
		});
	}
	const users = await VK.user.getVK().api.messages.getConversationMembers({
		peer_id: message.peerId,
	});
	const randomUser = users.profiles?.find(
		(x) =>
			x.id ===
			utils.array.random(users.items.filter((x) => x.member_id > 0)).member_id,
	);
	return await message.reply({
		message: `Мне кажется что ${message.args[1]} это @id${randomUser?.id} (${randomUser?.first_name} ${randomUser?.last_name})`,
		disable_mentions: true,
	});
});

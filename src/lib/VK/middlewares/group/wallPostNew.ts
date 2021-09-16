import { WallPostContext, getRandomId } from "vk-io";

import VK from "../../../VK/core";
import DB from "../../../DB/core";

async function groupWallPostNew(event: WallPostContext): Promise<void> {
	await VK.group.getVK().api.messages.send({
		message: `Опубликован новый ${event.isRepost ? "репост" : "пост"}`,
		attachment: event.wall.toString(),
		disable_mentions: true,
		peer_id: 2e9 + 6,
		random_id: getRandomId(),
	});

	for (const peer_id of DB.config.VK.groupReposts.chats) {
		await VK.slave.getAPI().messages.send({
			peer_id,
			attachment: event.wall.toString(),
			random_id: getRandomId(),
		});
	}

	for (const fake of VK.fakes.list) {
		await fake.getAPI().likes.add({
			item_id: event.wall.id,
			owner_id: event.wall.ownerId,
			type: "post",
		});
	}

	return;
}

export default groupWallPostNew;

import { WallPostContext, getRandomId } from "vk-io";

import VK from "../../../VK/core";

async function groupWallPostNew(event: WallPostContext): Promise<void> {
	VK.group.getVK().api.messages.send({
		message: `Опубликован новый ${event.isRepost ? "репост" : "пост"}`,
		attachment: `wall${event.wall.ownerId}_${event.wall.id}`,
		disable_mentions: true,
		peer_id: 2e9 + 6,
		random_id: getRandomId(),
	});
	return;
}

export default groupWallPostNew;

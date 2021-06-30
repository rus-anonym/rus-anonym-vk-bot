import { LikeContext, getRandomId } from "vk-io";

import VK from "../../../VK/core";

async function groupLikeAdd(
	event: LikeContext,
	next: () => void,
): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	if (event.objectType === "post") {
		const [userData] = await VK.fakes
			.getUserFakeAPI()
			.users.get({ user_ids: event.likerId.toString(), fields: ["sex"] });
		VK.group.getVK().api.messages.send({
			message: `@id${event.likerId} (${userData.first_name} ${
				userData.last_name
			}) ${userData.sex === 1 ? "поставила" : "поставил"} ❤️️ на пост`,
			attachment: `wall${event.objectOwnerId}_${event.objectId}`,
			disable_mentions: true,
			peer_id: 2e9 + 6,
			random_id: getRandomId(),
		});
		return;
	}
	next();
}

export default groupLikeAdd;

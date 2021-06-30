import { GroupMemberContext, getRandomId } from "vk-io";

import VK from "../../../VK/core";

async function groupJoin(event: GroupMemberContext): Promise<void> {
	const [userData] = await VK.fakes
		.getUserFakeAPI()
		.users.get({ user_ids: event.likerId.toString(), fields: ["sex"] });
	VK.group.getVK().api.messages.send({
		message: `@id${event.userId} (${userData.first_name} ${
			userData.last_name
		}) ${userData.sex === 1 ? "вступила" : "вступил"} в группу ❤️️`,
		disable_mentions: true,
		peer_id: 2e9 + 6,
		random_id: getRandomId(),
	});
}

export default groupJoin;

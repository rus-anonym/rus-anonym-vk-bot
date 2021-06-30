/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GroupUpdateContext, getRandomId } from "vk-io";

import VK from "../../../VK/core";

const roles = [`пользователя`, `модератора`, `редактора`, `администратора`];

async function groupOfficersEdit(event: GroupUpdateContext): Promise<void> {
	const usersData = await VK.fakes.getUserFakeAPI().users.get({
		user_ids: [event.adminId!.toString(), event.userId.toString()],
		fields: ["sex"],
	});
	VK.group.getVK().api.messages.send({
		message: `@id${usersData[0].id} (${usersData[0].first_name} ${
			usersData[0].last_name
		}) ${
			event.oldLevel! < event.newLevel!
				? usersData[0].sex === 1
					? "повысила"
					: "повысил"
				: usersData[0].sex === 1
				? "понизила"
				: "понизил"
		} @id${usersData[1].id} (${usersData[1].first_name} ${
			usersData[1].last_name
		}) до ${roles[event.newLevel!]}`,
		disable_mentions: true,
		peer_id: 2e9 + 6,
		random_id: getRandomId(),
	});
}

export default groupOfficersEdit;

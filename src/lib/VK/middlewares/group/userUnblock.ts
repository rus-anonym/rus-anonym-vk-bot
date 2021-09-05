/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GroupUserContext, getRandomId } from "vk-io";

import VK from "../../../VK/core";

async function userBlock(event: GroupUserContext): Promise<void> {
	if (event.isExpired) {
		const [userData] = await VK.group.getAPI().users.get({
			user_ids: [event.userId.toString()],
			fields: ["sex", "first_name_gen", "last_name_gen"],
		});
		VK.group.getVK().api.messages.send({
			message: `@id${userData.id} (${userData.first_name} ${
				userData.last_name
			}) ${
				userData[1].sex === 1 ? "была разблокирована" : "был разблокирован"
			} по истечению срока`,
			disable_mentions: true,
			peer_id: 2e9 + 6,
			random_id: getRandomId(),
		});
		return;
	} else {
		const usersData = await VK.group.getAPI().users.get({
			user_ids: [event.adminId!.toString(), event.userId.toString()],
			fields: ["sex", "first_name_gen", "last_name_gen"],
		});
		VK.group.getVK().api.messages.send({
			message: `@id${usersData[0].id} (${usersData[0].first_name} ${
				usersData[0].last_name
			}) ${
				usersData[0].sex === 1
					? "досрочно разблокировал"
					: "досрочно разблокировал"
			} @id${usersData[1].id} (${usersData[1].first_name_gen} ${
				usersData[1].last_name_gen
			})`,
			disable_mentions: true,
			peer_id: 2e9 + 6,
			random_id: getRandomId(),
		});
		return;
	}
}

export default userBlock;

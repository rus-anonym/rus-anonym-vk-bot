import { UserCommand } from "../../../../utils/lib/commands/core";

import VK from "../../../../VK/core";
import InternalUtils from "../../../../utils/core";

new UserCommand({
	regexp: /^(?:!syncFriends)(?:\s(.*))?$/i,
	process: async function (message) {
		await message.loadMessagePayload();
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

		await message.editMessage({
			message: `Получаю друзей https://vk.com/id${userID}`,
		});

		const { items: userFriends } = await VK.master.getAPI().friends.get({
			user_id: userID,
			count: 10000,
		});

		await message.editMessage({
			message: `Друзья (${userFriends.length}) получены https://vk.com/id${userID}`,
		});

		while (userFriends.length) {
			const usersInfo = await VK.group.getAPI().users.get({
				user_ids: userFriends.splice(
					userFriends.length - 500,
					500,
				) as unknown as string[],
				fields: InternalUtils.user.mainUsersGetFields,
			});

			for (const user of usersInfo) {
				await InternalUtils.user.getUserData(user.id, user);
			}
		}

		await message.editMessage({
			message: `Обработал https://vk.com/id${userID}`,
		});
	},
});

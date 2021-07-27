import { UserCommand } from "../../../../utils/lib/commands/core";

import VK from "../../../../VK/core";
import InternalUtils from "../../../../utils/core";

new UserCommand(/^(?:!syncFriends)(?:\s(.*))?$/i, async function (message) {
	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.editMessage({
			message: error.message,
		});
	}

	await message.editMessage({
		message: `Получаю друзей https://vk.com/id${userID}`,
	});

	const { items: userFriends } = await VK.user.getVK().api.friends.get({
		user_id: userID,
		count: 10000,
	});

	await message.editMessage({
		message: `Друзья (${userFriends.length}) получены https://vk.com/id${userID}`,
	});

	while (userFriends.length) {
		const usersInfo = await VK.user.getVK().api.users.get({
			user_ids: userFriends
				.splice(userFriends.length - 500, 500)
				.map((x) => String(x)),
			fields: InternalUtils.user.mainUsersGetFields,
		});

		await message.editMessage({
			message: `Осталось: ${userFriends.length}`,
		});

		for (const user of usersInfo) {
			await InternalUtils.user.getUserData(userID, user);
		}
	}

	await message.editMessage({
		message: `Обработал https://vk.com/id${userID}`,
	});
});

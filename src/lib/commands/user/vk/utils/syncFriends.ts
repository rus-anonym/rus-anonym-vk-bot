import { createCollectIterator, Objects } from "vk-io";

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

	const iterator = createCollectIterator<Objects.FriendsUserXtrLists>({
		api: VK.user.getVK().api,
		method: "friends.get",
		params: {
			user_id: userID,
			fields: InternalUtils.user.mainUsersGetFields,
		},
		countPerRequest: 500,
	});

	for await (const chunk of iterator) {
		await message.editMessage({
			message: `Получаю друзей https://vk.com/id${userID}
Received: ${chunk.received}
Total: ${chunk.total}`,
		});
		for (const user of chunk.items) {
			await InternalUtils.user.getUserData(userID, user);
		}
	}

	await message.editMessage({
		message: `Обработал https://vk.com/id${userID}`,
	});
});

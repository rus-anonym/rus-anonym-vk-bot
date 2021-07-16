import { UserCommand } from "../../../utils/lib/commands";

import InternalUtils from "../../../utils/core";

new UserCommand(/^(?:!update)$/i, async function (message) {
	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.editMessage({
			message: error.message,
		});
	}

	const userData = await InternalUtils.user.getUserData(userID);
	await InternalUtils.user.updateTrackUserData(userID);

	return await message.editMessage({
		message: `Данные о @id${userID} (${userData.info.extends.name_abl} ${userData.info.extends.surname_abl}) обновлены`,
	});
});

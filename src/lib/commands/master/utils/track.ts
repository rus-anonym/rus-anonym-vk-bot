import { UserCommand } from "../../../utils/lib/commands/core";
import InternalUtils from "../../../utils/core";

new UserCommand(/(?:^!track)(?:\s(.*))?$/i, async function (message) {
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

	userData.info.isTrack = !userData.info.isTrack;
	userData.markModified("info.isTrack");
	await userData.save();

	return await message.reply({
		message: `Отслеживание пользователя @id${userID} ${
			userData.info.isTrack ? "включено" : "отключено"
		}`,
	});
});

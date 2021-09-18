import { SlaveCommand } from "../../utils/lib/commands/core";
import InternalUtils from "../../utils/core";
import DB from "../../DB/core";

new SlaveCommand(/(?:^add master)(?:\s(.*))?$/i, async function (message) {
	if (message.senderId !== DB.config.VK.user.master.id) {
		return;
	}

	await message.loadMessagePayload();

	let userID: number;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.editMessage({
			message: error.message,
		});
	}

	if (userID > 0) {
		if (DB.main.config.data.slaveAccessList.includes(userID)) {
			return await message.reply(`Пользователь уже владелец раба`);
		} else {
			DB.main.config.data.slaveAccessList.push(userID);
			await DB.main.config.data.save();
			return await message.reply(`@id${userID} дан статус владельца раба`, {
				disable_mentions: true,
			});
		}
	} else {
		return await message.reply({
			message: `Владельцем раба может быть только пользователь`,
		});
	}
});

new SlaveCommand(/(?:^remove master)(?:\s(.*))?$/i, async function (message) {
	if (message.senderId !== DB.config.VK.user.master.id) {
		return;
	}

	await message.loadMessagePayload();

	let userID: number;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.editMessage({
			message: error.message,
		});
	}

	if (userID > 0) {
		if (!DB.main.config.data.slaveAccessList.includes(userID)) {
			return await message.reply(`Пользователь не владелец раба`);
		} else {
			const index = DB.main.config.data.slaveAccessList.findIndex(
				(x) => x === userID,
			);
			DB.main.config.data.slaveAccessList.splice(index, 1);
			await DB.main.config.data.save();
			return await message.reply(`У @id${userID} убран статус владельца раба`, {
				disable_mentions: true,
			});
		}
	} else {
		return await message.reply({
			message: `Владельцем раба может быть только пользователь`,
		});
	}
});

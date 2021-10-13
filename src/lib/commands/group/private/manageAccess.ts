import { GroupCommand } from "../../../utils/lib/commands/core";
import InternalUtils from "../../../utils/core";
import DB from "../../../DB/core";

new GroupCommand({
	regexp: /(?:^!add access)(?:\s(.*))?$/i,
	process: async function (message) {
		if (message.senderId !== DB.config.VK.user.master.id) {
			return;
		}

		await message.loadMessagePayload();

		let userID: number;
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

		if (userID > 0) {
			if (DB.main.config.data.botPrivateAccessList.includes(userID)) {
				return await message.reply(`Пользователь уже владелец раба`);
			} else {
				DB.main.config.data.botPrivateAccessList.push(userID);
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
	},
});

new GroupCommand({
	regexp: /(?:^!remove access)(?:\s(.*))?$/i,
	process: async function (message) {
		if (message.senderId !== DB.config.VK.user.master.id) {
			return;
		}

		await message.loadMessagePayload();

		let userID: number;
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

		if (userID > 0) {
			if (!DB.main.config.data.botPrivateAccessList.includes(userID)) {
				return await message.reply(`Пользователь не владелец раба`);
			} else {
				const index = DB.main.config.data.botPrivateAccessList.findIndex(
					(x) => x === userID,
				);
				DB.main.config.data.botPrivateAccessList.splice(index, 1);
				await DB.main.config.data.save();
				return await message.reply(
					`У @id${userID} убран статус владельца раба`,
					{
						disable_mentions: true,
					},
				);
			}
		} else {
			return await message.reply({
				message: `Владельцем раба может быть только пользователь`,
			});
		}
	},
});

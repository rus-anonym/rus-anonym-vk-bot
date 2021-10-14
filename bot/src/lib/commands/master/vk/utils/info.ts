import moment from "moment";
import utils from "rus-anonym-utils";

import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtils from "../../../../utils/core";

new UserCommand({
	regexp: /(?:^!инфо|!info)(?:\s(.*))?$/i,
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

		const userData = await InternalUtils.user.getUserData(userID);

		return message.reply({
			disable_mentions: true,
			message: `@id${userData.id} (${userData.info.name} ${
				userData.info.surname
			}):
Статус: ${userData.info.extends.status}
Сообщений: ${userData.messages.length}
Сообщений в ЛС: ${userData.personalMessages.length}
Сообщений в беседах: ${
				userData.messages.length - userData.personalMessages.length
			}
Зарегистрирован в ВК: ${moment(
				await utils.vk.user.getUserRegDate(userData.id),
			).format("DD.MM.YYYY, HH:mm:ss")}
Последнее изменение данных в ВК: ${moment(
				await utils.vk.user.getUserModifiedDate(userData.id),
			).format("DD.MM.YYYY, HH:mm:ss")}
Зарегистрирован в БД: ${moment(userData.regDate).format("DD.MM.YYYY, HH:mm:ss")}
Последнее изменение данных в БД: ${moment(userData.updateDate).format(
				"DD.MM.YYYY, HH:mm:ss",
			)}Упоминания пользователя: https://vk.com/feed?obj=${
				userData.id
			}&q=&section=mentions`,
		});
	},
});

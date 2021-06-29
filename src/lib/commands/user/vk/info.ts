import { resolveResource } from "vk-io";
import moment from "moment";
import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands";
import InternalUtils from "../../../utils/core";

new UserCommand(/(?:^!инфо|!info)(?:\s(.*))?$/i, async function (message, vk) {
	await message.loadMessagePayload();
	let userID;
	if (message.forwards[0]) {
		userID = message.forwards[0].senderId;
	} else if (message.replyMessage) {
		userID = message.replyMessage.senderId;
	} else if (message.args[1]) {
		try {
			const linkData = await resolveResource({
				resource: message.args[1],
				api: vk.api,
			});
			userID = linkData.id;
		} catch (error) {
			return await message.editMessage({
				message: "Не смог распознать ссылку",
			});
		}
	} else if (!message.isChat) {
		userID = message.peerId;
	} else {
		return await message.editMessage({
			message: "Не смог распознать ссылку",
		});
	}

	const userData = await InternalUtils.user.getUserData(userID);

	return message.reply({
		disable_mentions: true,
		message: `@id${userData.id} (${userData.info.name} ${
			userData.info.surname
		}):
Статус: ${userData.info.status}
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
		)}
${
	userData.info.last_seen
		? `
Последнее появление в сети: ${moment(userData.info.last_seen.date).format(
				"DD.MM.YYYY, HH:mm:ss",
		  )}
Текущий статус: ${userData.info.last_seen.isOnline ? `Онлайн` : `Офлайн`}\n`
		: ""
}Упоминания пользователя: https://vk.com/feed?obj=${
			userData.id
		}&q=&section=mentions`,
	});
});

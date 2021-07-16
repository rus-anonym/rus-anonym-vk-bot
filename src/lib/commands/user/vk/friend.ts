import { UserCommand } from "../../../utils/lib/commands";
import InternalUtils from "../../../utils/core";
import VK from "../../../VK/core";

new UserCommand(/(?:^(\+|-)др)(?:\s(.*))?$/i, async function (message) {
	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.editMessage({
			message: error.message,
		});
	}

	try {
		const [userStatus] = await VK.user.getVK().api.friends.areFriends({
			user_ids: userID,
		});

		if (message.args[1] === "+") {
			if (userStatus.friend_status === 1) {
				return message.reply({
					disable_mentions: true,
					message: `Заявка уже отправлена пользователю`,
				});
			}

			if (userStatus.friend_status === 3) {
				return message.reply({
					disable_mentions: true,
					message: `Пользователь уже находится в друзьях`,
				});
			}

			const response = await VK.user.getVK().api.friends.add({
				user_id: userID,
			});
			return message.reply({
				disable_mentions: true,
				message: `Заявка ${
					response === 2
						? "принята"
						: response === 4
						? "повторно отправлена"
						: "отправлена"
				}`,
			});
		} else {
			if (userStatus.friend_status === 0) {
				return message.reply({
					disable_mentions: true,
					message: `Пользователь не является другом`,
				});
			}

			if (userStatus.friend_status === 2) {
				return message.reply({
					disable_mentions: true,
					message: `Пользователь подписан на вас`,
				});
			}

			const response = await VK.user.getVK().api.friends.delete({
				user_id: userID,
			});
			let text = ``;
			if (response.friend_deleted) {
				text = "Пользователь удалён из друзей";
			}
			if (response.in_request_deleted) {
				text = "Входящая заявка отменена";
			}
			if (response.out_request_deleted) {
				text = "Исходящая заявка отменена";
			}
			if (response.suggestion_deleted) {
				text = "Рекомендация отклонена";
			}
			return message.reply({
				disable_mentions: true,
				message: text,
			});
		}
	} catch (error) {
		return message.reply({
			disable_mentions: true,
			message: `Ошибка: ${error.message}`,
		});
	}
});

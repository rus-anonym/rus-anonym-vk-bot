import moment from "moment";
import { Keyboard } from "vk-io";

import { GroupCommand } from "../../../../utils/lib/commands/core";
import DB from "../../../../DB/core";

new GroupCommand({
	regexp: /(?:^!беседы рандом)$/i,
	process: async function (message) {
		const [randomConversation] = await DB.main.models.vkConversation.aggregate([
			{
				$sample: { size: 1 },
			},
			...(DB.main.config.data.botPrivateAccessList.includes(message.senderId)
				? []
				: [
						{
							$match: { source: "newsfeed.search" },
						},
				  ]),
		]);
		if (!randomConversation) {
			return message.state.sendMessage(`Непредвиденная ошибка`);
		}
		const botCount = randomConversation.members.filter(
			(x: number) => x < 0,
		).length;
		return await message.state.sendMessage({
			message: `Название: ${randomConversation.title}
Ссылка: ${randomConversation.link}
Добавлена: ${moment(randomConversation.regDate).format("DD.MM.YYYY, HH:mm:ss")}
Обновлена: ${moment(randomConversation.updateDate).format(
				"DD.MM.YYYY, HH:mm:ss",
			)}
Участников: ${randomConversation.members.length}
Пользователей: ${randomConversation.members.length - botCount}
Ботов: ${botCount}`,
			keyboard: Keyboard.builder()
				.textButton({
					label: "Ещё беседа",
					payload: {
						cmd: "!беседы рандом",
					},
				})
				.inline(),
		});
	},
});

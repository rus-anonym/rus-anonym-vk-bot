import { GroupCommand } from "../../../../utils/lib/commands/core";
import DB from "../../../../DB/core";
import VK from "../../../../VK/core";

new GroupCommand({
	regexp: /(?:^!беседы добавить)(?:\s(.*))$/i,
	process: async function (message) {
		const source = message.state.args[1].match(/(vk.me\/join\/(?:[\w/=]+))/gi);
		if (!source || !source[0]) {
			return message.state.sendMessage(`Ссылка на беседу не найдена`);
		}
		const link = source[0];
		const dbInfo = await DB.main.models.vkConversation.findOne({
			link: "https://" + link,
		});

		if (dbInfo) {
			return message.state.sendMessage(`Данная беседа уже есть в базе`);
		}

		try {
			const conversationInfo = await VK.fakes
				.getUserFakeAPI()
				.messages.getChatPreview({
					link,
				});

			await DB.main.models.vkConversation.insertMany({
				source: "https://vk.com/id" + message.senderId,
				link: "https://" + link,
				title: conversationInfo.preview.title,
				ownerId: conversationInfo.preview.admin_id,
				members: conversationInfo.preview.members,
				updateDate: new Date(),
				regDate: new Date(),
			});

			return await message.state.sendMessage({
				message: `Беседа ${conversationInfo.preview.title} добавлена`,
			});
		} catch {
			return message.state.sendMessage(
				`Произошла ошибка, возможно ссылка неправильная`,
			);
		}
	},
});

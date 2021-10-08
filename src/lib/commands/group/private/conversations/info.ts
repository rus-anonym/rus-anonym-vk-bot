import { Keyboard } from "vk-io";

import { GroupCommand } from "../../../../utils/lib/commands/core";
import DB from "../../../../DB/core";

new GroupCommand({
	regexp: /(?:^!беседы)$/i,
	process: async function (message) {
		return await message.state.sendMessage({
			message: `Количество бесед в БД: ${await DB.main.models.vkConversation.countDocuments()}`,
			keyboard: Keyboard.builder()
				.textButton({
					label: "Рандомная беседа",
					payload: {
						cmd: "!беседы рандом",
					},
				})
				.textButton({
					label: "Беседы",
					payload: {
						cmd: "!беседы",
					},
				})
				.inline(),
		});
	},
});

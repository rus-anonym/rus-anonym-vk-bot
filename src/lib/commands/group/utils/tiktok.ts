import axios from "axios";
import { Keyboard } from "vk-io";

import { GroupCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";
import DB from "../../../DB/core";

new GroupCommand({
	regexp: /(?:^\/tiktok)(\s(.*))$/i,
	process: async function (context) {
		await context.state.sendMessage({
			message: `Обрабатываю видео...`,
		});

		try {
			const response = await (
				await axios({
					url: "https://godownloader.com/api/tiktok-no-watermark-free",
					params: {
						url: context.state.args[1],
						key: "godownloader.com",
					},
				})
			).data;

			if (!response.video_no_watermark) {
				throw new Error(`Непредвиденная ошибка, повторите запрос.`);
			}

			const message = `TikTok video:`;

			const builder = Keyboard.builder();

			builder.urlButton({
				label: `Скачать видео`,
				url: response.video_no_watermark,
			});
			builder.row();
			builder.urlButton({
				label: `Скачать звук`,
				url: response.music_url,
			});

			builder.inline();

			const userResponse = await context.state.sendMessage({
				message,
				dont_parse_links: true,
				keyboard: builder,
			});

			const attachment = await VK.master.main.upload.video({
				source: {
					value: response.video_no_watermark,
				},
				group_id: DB.config.VK.group.id,
				name: response.aweme_id,
				is_private: 1,
				compression: 0,
				repeat: 1,
			});

			return await VK.group.getVK().api.messages.edit({
				peer_id: context.peerId,
				conversation_message_id: userResponse.conversationMessageId,
				message,
				attachment: attachment.toString(),
				keyboard: builder,
			});
		} catch (error) {
			return await context.state.sendMessage({
				message: `Ошибка: ${error.toString()}`,
				dont_parse_links: true,
			});
		}
	},
});

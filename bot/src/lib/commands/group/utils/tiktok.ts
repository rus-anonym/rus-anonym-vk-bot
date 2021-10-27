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

			const builder = Keyboard.builder();

			builder.urlButton({
				label: `Скачать видео`,
				url: response.video_no_watermark,
			});

			builder.inline();

			const userResponse = await context.state.sendMessage({
				message: `TikTok video:`,
				dont_parse_links: true,
				keyboard: builder,
				content_source: JSON.stringify({
					type: "message",
					owner_id: context.senderId,
					peer_id: context.peerId,
					conversation_message_id: context.conversationMessageId,
				}),
			});

			const attachment = await VK.slave.main.upload.video({
				source: {
					value: response.video_no_watermark,
				},
				group_id: DB.config.VK.group.id,
				name: "TikTok Video",
				is_private: 1,
				compression: 0,
				repeat: 1,
			});

			return await VK.group.getAPI().messages.edit({
				peer_id: context.peerId,
				conversation_message_id: userResponse.conversationMessageId,
				message: "",
				attachment: attachment.toString(),
				keyboard: builder,
				content_source: JSON.stringify({
					type: "message",
					owner_id: context.senderId,
					peer_id: context.peerId,
					conversation_message_id: context.conversationMessageId,
				}),
			});
		} catch (error) {
			return await context.state.sendMessage({
				message: `Ошибка: ${error.toString()}`,
				dont_parse_links: true,
			});
		}
	},
});

import axios from "axios";

import { GroupCommand } from "../../../utils/lib/commands/core";

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

			return await context.state.sendMessage({
				message: `TikTok video:
Video URL: ${response.video_no_watermark}
Music URL: ${response.music_url}`,
				dont_parse_links: true,
			});
		} catch (error) {
			return await context.state.sendMessage({
				message: `Ошибка: ${error.toString()}`,
				dont_parse_links: true,
			});
		}
	},
});

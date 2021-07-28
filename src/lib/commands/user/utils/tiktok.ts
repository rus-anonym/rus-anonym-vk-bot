import axios from "axios";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!tiktok)(\s(.*))$/i, async function (message) {
	try {
		const response = await (
			await axios({
				url: "https://godownloader.com/api/tiktok-no-watermark-free",
				params: {
					url: message.state.args[1],
					key: "godownloader.com",
				},
			})
		).data;

		return await message.reply({
			message: `TikTok video:
Video URL: ${response.video_no_watermark}
Music URL: ${response.music_url}`,
			dont_parse_links: true,
		});
	} catch (error) {
		return await message.reply({
			message: `Ошибка при выполнении команды:\n${error.message}`,
			dont_parse_links: true,
		});
	}
});

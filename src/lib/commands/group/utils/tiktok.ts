import axios from "axios";

import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand({
		regexp: /(?:^\/tiktok)(\s(.*))$/i, process: async function (message) {
			const response = await (
				await axios({
					url: "https://godownloader.com/api/tiktok-no-watermark-free",
					params: {
						url: message.state.args[1],
						key: "godownloader.com",
					},
				})
			).data;

			return await message.state.sendMessage({
				message: `TikTok video:
Video URL: ${response.video_no_watermark}
Music URL: ${response.music_url}`,
				dont_parse_links: true,
			});
		}
	});

import axios from "axios";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!tiktok)(\s(.*))$/i, async function (message) {
	const response = await (
		await axios({
			url: "https://godownloader.com/api/tiktok-no-watermark-free",
			params: {
				url: message.args[1],
				key: "godownloader.com",
			},
		})
	).data;

	return await message.editMessage({
		message: `TikTok video:
Video URL: ${response.video_no_watermark}
Music URL: ${response.music_url}`,
		dont_parse_links: true,
	});
});

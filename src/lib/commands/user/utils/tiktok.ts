import axios from "axios";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!tiktok)(\s(.*))$/i, async function (context, vk) {
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

	const message = `TikTok video:
Video URL: ${response.video_no_watermark}
Music URL: ${response.music_url}`;

	const userResponse = await context.reply({
		message,
		dont_parse_links: true,
	});

	const attachment = await vk.upload.video({
		source: {
			value: response.video_no_watermark,
		},
		name: response.aweme_id,
		is_private: 1,
		compression: 0,
		repeat: 1,
	});

	return await vk.api.messages.edit({
		peer_id: context.peerId,
		message_id: userResponse.id,
		message,
		attachment: attachment.toString(),
	});
});

new UserCommand(/^(https:\/\/(vm|www).tiktok.com\/(?:.*))/, async function (
	context,
	vk,
) {
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

	const attachment = await vk.upload.video({
		source: {
			value: response.video_no_watermark,
		},
		name: response.aweme_id,
		is_private: 1,
		compression: 0,
		repeat: 1,
	});

	await context.reply({
		attachment: attachment.toString(),
		message: context.text?.replace(
			/^(https:\/\/(vm|www).tiktok.com\/(?:.*))$/i,
			"",
		),
	});
});

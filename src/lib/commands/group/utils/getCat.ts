import axios from "axios";
import { Keyboard } from "vk-io";

import { GroupCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";

new GroupCommand({
	regexp: /(?:^котик)$/i,
	process: async function (message) {
		const randomCat = await axios.get("https://cataas.com/cat?json=true");

		const attachment = await VK.group.getVK().upload.messagePhoto({
			peer_id: message.peerId,
			source: {
				value: "https://cataas.com" + randomCat.data.url,
				filename: "cat.jpg",
			},
		});

		return message.state.sendMessage({
			attachment: attachment.toString(),
			keyboard: Keyboard.builder()
				.textButton({
					label: "Ещё котик",
					payload: {
						cmd: "котик",
					},
				})
				.inline(),
		});
	},
});

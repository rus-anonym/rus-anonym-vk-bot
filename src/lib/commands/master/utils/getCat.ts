import axios from "axios";

import { UserCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";

new UserCommand(/(?:^котик)$/i, async function (message) {
	const randomCat = await axios.get("https://cataas.com/cat?json=true");

	const attachment = await VK.master.getVK().upload.messagePhoto({
		peer_id: message.peerId,
		source: {
			value: "https://cataas.com" + randomCat.data.url,
			filename: "cat.jpg",
		},
	});

	return message.editMessage({
		message: "",
		attachment: attachment.toString(),
	});
});

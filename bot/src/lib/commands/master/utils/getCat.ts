import axios from "axios";
import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";

const getRandomCatUrl = async (): Promise<string> => {
	const services = [
		"https://cataas.com/cat?json=true",
		"https://api.thecatapi.com/v1/images/search?mime_types=jpg,png",
	] as const;

	const randomService = utils.array.random<typeof services[number]>(
		services as never,
	);

	switch (randomService) {
		case "https://cataas.com/cat?json=true": {
			const randomCat = await axios.get("https://cataas.com/cat?json=true");
			return "https://cataas.com" + randomCat.data.url;
		}
		case "https://api.thecatapi.com/v1/images/search?mime_types=jpg,png": {
			const randomCat = await axios.get(
				"https://api.thecatapi.com/v1/images/search?mime_types=jpg,png",
			);
			return randomCat.data[0].url;
		}
	}
};

new UserCommand({
		regexp: /(?:^котик)$/i, process: async function (message) {
			const value = await getRandomCatUrl();
			const attachment = await VK.master.getVK().upload.messagePhoto({
				peer_id: message.peerId,
				source: {
					value,
					filename: "cat.jpg",
				},
			});

			return message.editMessage({
				message: "",
				attachment: attachment.toString(),
			});
		}
	});

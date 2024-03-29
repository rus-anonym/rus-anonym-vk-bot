import axios from "axios";
import cheerio from "cheerio";

import { UserCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";

const getHTPPCodeData = async (
	code: number,
): Promise<{
	image: string;
	title: string;
	description: string;
}> => {
	const codeData = await axios.get(
		"https://developer.mozilla.org/ru/docs/Web/HTTP/Status/" + code,
	);

	const $ = cheerio.load(codeData.data);

	return {
		title: $("#content > article > h1").text(),
		description: $(
			"#content > article > div:nth-child(2) > p:nth-child(2)",
		).text(),
		image: "https://http.cat/" + code,
	};
};

new UserCommand({
		regexp: /(?:^http)(?:\s(\d+))$/i, process: async function (message) {
			try {
				const { image, title, description } = await getHTPPCodeData(
					Number(message.state.args[1]) || 100);
				const attachment = await VK.master.getVK().upload.messagePhoto({
					peer_id: message.peerId,
					source: {
						value: image,
						filename: "cat.jpg",
					},
				});
				return message.editMessage({
					message: title + `\n` + description,
					attachment: attachment.toString(),
				});
			} catch (error) {
				return message.editMessage({
					message: `Такой код не найден`,
				});
			}
		}
	});

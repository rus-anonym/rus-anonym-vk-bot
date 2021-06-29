import { createCollectIterator, Objects } from "vk-io";
import utils from "rus-anonym-utils";
import moment from "moment";

import { UserCommand } from "../../../utils/lib/commands";
import InternalUtils from "../../../utils/core";

new UserCommand(/^(?:!clear)(?:\s(\d+))$/i, async function (context, vk) {
	const iterator = createCollectIterator({
		api: vk.api,
		method: "messages.getHistory",
		countPerRequest: 200,
		params: {
			peer_id: context.peerId,
		},
		maxCount: Number(context.args[1]) || 10,
	});

	const minimalTimeForDelete = moment().subtract(1, "day");

	for await (const chunk of iterator) {
		const splittedChunk = utils.array.splitOn(chunk.items, 1000);

		for (const nestedChunk of splittedChunk as Objects.MessagesMessage[][]) {
			const filteredNestedChunk = nestedChunk.filter(
				(x) => x.out === 1 && moment(x.date * 1000) > minimalTimeForDelete,
			);

			// for (const message of filteredNestedChunk) {
			// 	if (
			// 		message.text ||
			// 		(message.attachments &&
			// 			message.attachments[0] &&
			// 			message.attachments[0].type !== "sticker")
			// 	) {
			// 		await VK.user.getVK().api.messages.edit({
			// 			message_id: message.id,
			// 			peer_id: message.peer_id,
			// 			keep_snippets: 0,
			// 			keep_forward_messages: 0,
			// 			dont_parse_links: true,
			// 			attachment: "",
			// 			message: (() => {
			// 				let output = "";
			// 				const words = "defbca1234567890";
			// 				while (output.length < 4000) {
			// 					output += words[Math.floor(Math.random() * words.length)];
			// 				}
			// 				return output;
			// 			})(),
			// 		});
			// 	}
			// }
			await vk.api.messages.delete({
				delete_for_all: 1,
				message_ids: filteredNestedChunk.map((x) => x.id),
			});
		}
	}

	InternalUtils.logger.send(
		`Очистил ${
			Number(context.args[1]) || 10
		} сообщений в чате https://vk.com/im?sel=${context.isChat ? "c" : ""}${
			context.peerId
		}`,
	);
});

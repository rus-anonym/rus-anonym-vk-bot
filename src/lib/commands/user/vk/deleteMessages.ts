import utils from "rus-anonym-utils";
import moment from "moment";

import DB from "../../../DB/core";
import VK from "../../../VK/core";

import { UserCommand } from "../../../utils/lib/commands";

new UserCommand(/^(?:!clear)(?:\s(\d+))$/i, async function (context) {
	const messagesForDelete = (await DB.user.models.message.aggregate([
		{
			$match: {
				id: {
					$ne: context.id,
				},
				senderId: DB.config.VK.user.id,
				peerId: context.peerId,
				created: {
					$gte: moment().subtract(1, "day").toDate(),
				},
			},
		},
		{
			$sort: {
				created: -1,
			},
		},
		{
			$limit: Number(context.args[1] || 10),
		},
		{
			$group: {
				_id: "$id",
			},
		},
	])) as Array<{ _id: number }>;

	let deletedMessages = 0;

	for (const chunk of utils.array.splitTo(messagesForDelete, 1000)) {
		await VK.user.getVK().api.messages.delete({
			message_ids: chunk.map((x) => x._id),
			delete_for_all: 1,
		});
		deletedMessages += chunk.length;
	}

	await context.editMessage({
		message: `Удалил ${deletedMessages} ${utils.string.declOfNum(
			deletedMessages,
			["сообщение", `сообщения`, `сообщений`],
		)}`,
	});
});

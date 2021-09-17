import utils from "rus-anonym-utils";
import moment from "moment";

import DB from "../../../../DB/core";
import VK from "../../../../VK/core";

import { UserCommand } from "../../../../utils/lib/commands/core";

new UserCommand({
		regexp: /^(?:!clear)(?:\s(\d+))$/i, process: async function (context) {
			const messagesForDelete = (await DB.user.models.message.aggregate([
				{
					$match: {
						id: {
							$ne: context.id,
						},
						senderId: DB.config.VK.user.master.id,
						peerId: context.peerId,
						isDeleted: false,
						isDeletedForAll: false,
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
					$limit: Number(context.state.args[1] || 10),
				},
				{
					$group: {
						_id: "$id",
					},
				},
			])) as Array<{ _id: number; }>;

			let deletedMessages = 0;

			for (const chunk of utils.array.splitTo(messagesForDelete, 1000)) {
				await VK.master.getVK().api.messages.delete({
					message_ids: chunk.map((x) => x._id),
					delete_for_all: 1,
				});
				deletedMessages += chunk.length;
			}

			await context.editMessage({
				message: `Удалил ${deletedMessages} ${utils.string.declOfNum(
					deletedMessages,
					["сообщение", `сообщения`, `сообщений`])}`,
			});
		}
	});

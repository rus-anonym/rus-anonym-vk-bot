import { MessageDocument } from "./../../../DB/types";
import { user, group } from "../../core";
import Models from "../../../DB/models";

user.main.updates.on("message", async function (message) {
	if (message.subTypes[0] === "message_new") {
		const SavedMessage = new Models.message({
			id: message.id,
			conversationMessageId: message.conversationMessageId,
			peerId: message.peerId,
			peerType: message.peerType,
			senderId: message.senderId,
			senderType: message.senderType,
			created: new Date(message.createdAt * 1000),
			updated: new Date(message.createdAt * 1000),
			isOutbox: message.isOutbox,
			events: [
				{
					updatedAt: message.updatedAt || 0,
					text: message.text || "",
					attachments: message.attachments.map((x) => {
						return x.toString();
					}),
					type: message.type,
					subTypes: message.subTypes || [],
					hasReply: message.hasReplyMessage,
					hasForwards: message.hasForwards,
				},
			],
			data: [
				(await user.getVK().api.messages.getById({ message_ids: message.id }))
					.items[0],
			],
		});
		try {
			await SavedMessage.save();
		} catch (error) {
			console.log(error);
			console.log(SavedMessage.events[0]);
		}
	} else if (message.subTypes[0] === "message_edit") {
		let oldMessageData: MessageDocument = await Models.message.findOne({
			id: message.id,
		});
		if (!oldMessageData) {
			return;
		} else {
			oldMessageData.events.push({
				updatedAt: message.updatedAt || 0,
				text: message.text || "",
				attachments: message.attachments.map((x) => {
					return x.toString();
				}),
				type: message.type,
				subTypes: message.subTypes || [],
				hasReply: message.hasReplyMessage,
				hasForwards: message.hasForwards,
			});
			oldMessageData.data.push(
				(await user.getVK().api.messages.getById({ message_ids: message.id }))
					.items[0],
			);
			if (message.updatedAt) {
				oldMessageData.updated = new Date(message.updatedAt * 1000);
			}
			await oldMessageData.save();
		}
	} else {
		console.log(`Unhandled type ${message.subTypes[0]}`);
	}
});

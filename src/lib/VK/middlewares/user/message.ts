import { MessageDocument } from "./../../../DB/types";
import { user } from "../../core";
import Models from "../../../DB/models";
import utils from "rus-anonym-utils";
import * as InternalUtils from "../../../utils";
import DataBase from "../../../DB/core";
import commands from "../../../commands";

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
			utils.logger.error("Error on save new message #id=" + message.id);
		}
	} else if (message.subTypes[0] === "message_edit") {
		const oldMessageData: MessageDocument = await Models.message.findOne({
			id: message.id,
		});
		if (oldMessageData) {
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
			try {
				await oldMessageData.save();
			} catch (error) {
				utils.logger.error("Error on save edit message #id=" + message.id);
			}
		}
	} else {
		utils.logger.warn(
			"Unhandled event on type message with subtypes: " +
				message.subTypes.join(),
		);
	}
	if (message.senderId === DataBase.config.vk.user.id && message.text) {
		const selectedCommand = commands.userCommands.find((command) => {
			for (const regexp of command.regexp) {
				if (regexp.test(message.text || "") === true) {
					message.args = (message.text || "").match(regexp);
					return command;
				}
			}
		});
		if (selectedCommand) {
			const TempVK = user.getVK();
			try {
				await selectedCommand.process(message, TempVK);
			} catch (error) {
				utils.logger.warn("Error on executed command");
			}
		}
	}
});

user.main.updates.on("message_flags", async function (context) {
	if (
		context.subTypes[0] === "message_flags_add" &&
		context.isDeleted &&
		!context.isDeletedForAll
	) {
		const tempVK = user.getVK();
		await tempVK.api.messages.restore({ message_id: context.id });
		try {
			await tempVK.api.messages.edit({
				message_id: context.id,
				message: InternalUtils.generateRandomString(3500),
				peer_id: context.peerId,
				attachment: "",
				keep_forward_messages: 0,
				keep_snippets: 0,
				dont_parse_links: 1,
			});
		} catch (error) {
			//
		}

		await tempVK.api.messages.delete({
			message_ids: context.id,
			delete_for_all: 1,
		});
	}
});

import { MessageContext } from "vk-io";
import { user } from "../../core";
import Models from "../../../DB/models";
import * as utils from "rus-anonym-utils";
import * as InternalUtils from "../../../utils";
import DataBase from "../../../DB/core";
import commands from "../../../commands";
import { logError } from "../../../logger";

async function saveMessageToDB(message: MessageContext): Promise<void> {
	if (message.subTypes[0] === "message_new") {
		const SavedMessage = new Models.message({
			id: message.id,
			conversationMessageId: message.conversationMessageId,
			peerId: message.peerId,
			peerType: message.peerType,
			senderId:
				message.isOutbox === true
					? DataBase.config.vk.user.id
					: message.senderId,
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
		const oldMessageData = await Models.message.findOne({
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
	if (!message.isGroup) {
		const userData = await DataBase.models.user.findOne({
			id: message.senderId,
		});
		if (!userData) {
			const userVKData = await InternalUtils.getUserData(message.senderId);
			const newUserData = new DataBase.models.user({
				id: message.senderId,
				messages: [message.id],
				vk: {
					name: userVKData.first_name,
					surname: userVKData.last_name,
				},
				updateDate: new Date(),
				regDate: new Date(),
			});
			await newUserData.save();
		} else {
			userData.messages.push(message.id);
			await userData.save();
		}
	}
	if (message.isChat && message.chatId) {
		const chatData = await DataBase.models.chat.findOne({
			id: message.chatId,
		});
		if (!chatData) {
			const chatVKData = await user.getVK().api.call("messages.getChat", {
				chat_id: message.chatId,
				fields:
					"nickname, screen_name, sex, bdate, city, country, timezone, photo_50, photo_100, photo_200_orig, has_mobile, contacts, education, online, counters, relation, last_seen, status, can_write_private_message, can_see_all_posts, can_post, universities",
			});
			const parsedData: Array<{
				id: number;
				type: "profile" | "group";
			}> = chatVKData.users.map(
				(x: { id: number; type: "profile" | "group" }) => {
					return {
						id: x.id,
						type: x.type,
					};
				},
			);
			const newChatData = new DataBase.models.chat({
				id: message.chatId,
				messages: [message.id],
				creator: chatVKData.admin_id,
				data: {
					members: parsedData.map((x) => {
						return x.id;
					}),
					users: parsedData.filter((x) => x.type === "profile").length,
					bots: parsedData.filter((x) => x.type === "group").length,
					title: chatVKData.title,
				},
				updateDate: new Date(),
				regDate: new Date(),
			});
			await newChatData.save();
		} else {
			chatData.messages.push(message.id);
			await chatData.save();
		}
	}
	return;
}

user.main.updates.on("message", async function (message: MessageContext) {
	await saveMessageToDB(message);
	if (message.isOutbox && message.text) {
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
				await logError(error);
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

import { typedModel } from "ts-mongoose";
import { MessageContext } from "vk-io";
import mongoose from "mongoose";

import VK from "../VK/core";
import config from "../../DB/config.json";
import schemes from "./schemes";
import InternalUtils from "../utils/core";

mongoose.Schema.Types.String.checkRequired((text) => text !== null);

class DB {
	public config = config;

	public connection = mongoose.createConnection(
		`mongodb+srv://${config.db.mongo.login}:${config.db.mongo.password}@${config.db.mongo.address}/${config.db.mongo.db}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		},
	);

	public models = {
		message: typedModel(
			"message",
			schemes.message,
			"messages",
			undefined,
			undefined,
			this.connection,
		),
		user: typedModel(
			"user",
			schemes.user,
			"users",
			undefined,
			undefined,
			this.connection,
		),
		chat: typedModel(
			"chat",
			schemes.chat,
			"chats",
			undefined,
			undefined,
			this.connection,
		),
	};

	public schemes = schemes;

	public async saveMessage(message: MessageContext): Promise<void> {
		switch (message.subTypes[0]) {
			case "message_new": {
				await new this.models.message({
					id: message.id,
					conversationMessageId: message.conversationMessageId,
					peerId: message.peerId,
					peerType: message.peerType,
					senderId:
						message.isOutbox === true
							? this.config.vk.user.id
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
						(
							await VK.user
								.getVK()
								.api.messages.getById({ message_ids: message.id })
						).items[0],
					],
				}).save();
				break;
			}
			case "message_edit": {
				const oldMessageData = await this.models.message.findOne({
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
					const newMessageData = (
						await VK.user
							.getVK()
							.api.messages.getById({ message_ids: message.id })
					).items[0];
					oldMessageData.data.push(newMessageData);
					if (message.updatedAt) {
						oldMessageData.updated = new Date(message.updatedAt * 1000);
					}
					await oldMessageData.save();

					const isTranscriptAudioMessage: boolean =
						(newMessageData.attachments &&
							newMessageData.attachments[0] &&
							newMessageData.attachments[0].audio_message &&
							newMessageData.attachments[0].audio_message.transcript_state ===
								"done") ||
						false;

					if (message.isInbox && !isTranscriptAudioMessage) {
						InternalUtils.user.processEditedMessage(message, oldMessageData);
					}
				}

				break;
			}
			default: {
				break;
			}
		}

		if (!message.isGroup) {
			const fixedSenderId = message.isOutbox
				? this.config.vk.user.id
				: message.senderId;
			const userData = await this.models.user.findOne({
				id: fixedSenderId,
			});
			if (!userData) {
				const personalMessages = message.isChat === true ? [] : [message.id];
				const newUserData = new this.models.user({
					id: fixedSenderId,
					messages: [message.id],
					personalMessages: personalMessages,
					updateDate: new Date(),
					regDate: new Date(),
				});
				await newUserData.save();
			} else {
				if (message.isChat === false) {
					userData.personalMessages.push(message.id);
				} else {
					userData.messages.push(message.id);
				}
				userData.updateDate = new Date();
				await userData.save();
			}
		}

		if (message.isChat && message.chatId) {
			const chatData = await this.models.chat.findOne({
				id: message.chatId,
			});
			if (!chatData) {
				const newChatData = new this.models.chat({
					id: message.chatId,
					messages: [message.id],
					updateDate: new Date(),
					regDate: new Date(),
				});
				await newChatData.save();
			} else {
				chatData.messages.push(message.id);
				chatData.updateDate = new Date();
				await chatData.save();
			}
		}
	}
}

export default new DB();

import { MessageContext } from "vk-io";

import DataBase from "../../DB/core";
import VK from "../../VK/core";
import InternalUtils from "../core";

export default class UtilsDB {
	public async saveMessage(message: MessageContext): Promise<void> {
		switch (message.subTypes[0]) {
			case "message_new": {
				await new DataBase.models.message({
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
				const oldMessageData = await DataBase.models.message.findOne({
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
				? DataBase.config.vk.user.id
				: message.senderId;
			const userData = await DataBase.models.user.findOne({
				id: fixedSenderId,
			});
			if (!userData) {
				const personalMessages = message.isChat === true ? [] : [message.id];
				const newUserData = new DataBase.models.user({
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
			const chatData = await DataBase.models.chat.findOne({
				id: message.chatId,
			});
			if (!chatData) {
				const newChatData = new DataBase.models.chat({
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

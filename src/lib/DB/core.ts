import { typedModel } from "ts-mongoose";
import { MessageContext } from "vk-io";
import mongoose from "mongoose";

import InternalUtils from "../utils/core";
import VK from "../VK/core";
import config from "../../DB/config.json";
import schemes from "./schemes";
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

	public async saveMessage(message: MessageContext) {
		switch (message.subTypes[0]) {
			case "message_new":
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
			case "message_edit":
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
					oldMessageData.data.push(
						(
							await VK.user
								.getVK()
								.api.messages.getById({ message_ids: message.id })
						).items[0],
					);
					if (message.updatedAt) {
						oldMessageData.updated = new Date(message.updatedAt * 1000);
					}
					await oldMessageData.save();
				}
				break;
			default:
				await InternalUtils.logger.send(
					`Unhandled event on type message with subtypes:
				${message.subTypes.join()}`,
					"error",
				);
				break;
		}

		if (!message.isGroup) {
			const fixedSenderId =
				message.isOutbox === true ? this.config.vk.user.id : message.senderId;
			const userData = await this.models.user.findOne({
				id: fixedSenderId,
			});
			if (!userData) {
				const [userVKData] = await VK.user
					.getVK()
					.api.users.get({ user_ids: fixedSenderId.toString() });
				const personalMessages = message.isChat === true ? [] : [message.id];
				const newUserData = new this.models.user({
					id: fixedSenderId,
					messages: [message.id],
					vk: {
						name: userVKData.first_name,
						surname: userVKData.last_name,
					},
					personalMessages: personalMessages,
					updateDate: new Date(),
					regDate: new Date(),
				});
				await newUserData.save();
			} else {
				if (message.isChat === false) {
					userData.personalMessages.push(message.id);
				}
				userData.messages.push(message.id);
				await userData.save();
			}
		}

		if (message.isChat && message.chatId) {
			const chatData = await this.models.chat.findOne({
				id: message.chatId,
			});
			if (!chatData) {
				const chatVKData = await VK.user.getVK().api.call("messages.getChat", {
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
				const newChatData = new this.models.chat({
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
	}
}

export default new DB();

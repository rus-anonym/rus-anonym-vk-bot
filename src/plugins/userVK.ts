import { groupLogger } from "./logger";
import { bombMessages, config, userCommands } from "./core";
import { ModernUserMessageContext, messageDataBase } from "./types";
import { VK, IMessageContextSendOptions, MessageContext } from "vk-io";
import utils from "rus-anonym-utils";
import { DB } from "./db";

const userVK = new VK({
	token: config.vk.user.token,
	apiMode: "parallel",
	apiVersion: "5.130",
});

const internal = {
	filterWords: async (text: string) => {
		for (let i in config.censoringWord) {
			text.replace(new RegExp(config.censoringWord[i], `gi`), `*censored*`);
		}
		return text;
	},
	filterTypes: async (message: ModernUserMessageContext) => {
		let arrayWithBlockedTypes: Array<string> = [`messages_read`, `typing`];
		let arrayWithBlockedSubTypes: Array<string> = [
			`friend_online`,
			`friend_offline`,
		];
		for (let blockedType of arrayWithBlockedTypes) {
			if (message.type === blockedType) {
				return true;
			}
		}
		for (let blockedSubType of arrayWithBlockedSubTypes) {
			if (message.subTypes.find((x) => x === blockedSubType)) {
				return true;
			}
		}
		return false;
	},
	logMessageDeletion: async (oldMessage: messageDataBase) => {
		let messageData = {};
		let tempPeerTypeBool = oldMessage.message.peerType === `chat`;
		if (oldMessage.messageFullData.geo) {
			messageData = Object.assign(messageData, {
				lat: oldMessage.messageFullData.geo.coordinates.latitude,
				long: oldMessage.messageFullData.geo.coordinates.longitude,
			});
		}
		let tempMessageText = `Удалено сообщение пользователя @id${
			oldMessage.message.senderId
		} #${oldMessage.message.id} ${
			tempPeerTypeBool
				? `в беседе #${oldMessage.message.peerId - 2000000000}`
				: ``
		} от ${await utils.time.getDateTimeByMS(
			oldMessage.message.createdAt * 1000,
		)}\nТекст сообщения: ${oldMessage.message.text}`;
		let tempAttachmentsData = await groupLogger.uploadAttachmentsToVK(
			oldMessage.messageFullData.attachments || [],
			tempPeerTypeBool ? 2000000001 : 2000000002,
		);
		messageData = Object.assign(messageData, {
			attachment: tempAttachmentsData,
			message: tempMessageText,
		});
		return tempPeerTypeBool
			? await groupLogger.sendInConversationsLogs(messageData)
			: await groupLogger.sendInMessagesLogs(messageData);
	},
	logMessageEditing: async (
		message: ModernUserMessageContext,
		oldMessage: messageDataBase,
	) => {
		let editMessageText: string;
		let messageData = {};
		let tempPeerTypeBool = oldMessage.message.peerType === `chat`;
		let tempAttachmentsData: string = await groupLogger.uploadAttachmentsToVK(
			oldMessage.messageFullData.attachments || [],
			tempPeerTypeBool ? 2000000001 : 2000000002,
		);
		messageData = Object.assign(messageData, {
			attachment: tempAttachmentsData,
		});
		if (oldMessage.messageFullData.geo) {
			messageData = Object.assign(messageData, {
				lat: oldMessage.messageFullData.geo.coordinates.latitude,
				long: oldMessage.messageFullData.geo.coordinates.longitude,
			});
		}
		if (message.text !== oldMessage.message.text) {
			editMessageText = `Отредактировано сообщение пользователя @id${
				oldMessage.message.senderId
			} #${oldMessage.message.id} от ${await utils.time.getDateTimeByMS(
				oldMessage.message.updatedAt === 0
					? oldMessage.message.createdAt
					: oldMessage.message.updatedAt,
			)}
Предыдущий текст сообщения: ${oldMessage.message.text}`;
			messageData = Object.assign(messageData, {
				message: editMessageText,
			});
		}
		return tempPeerTypeBool
			? await groupLogger.sendInConversationsLogs(messageData)
			: await groupLogger.sendInMessagesLogs(messageData);
	},
	logBombMessagesDeleted: async (messageID: number) => {
		let oldMessage = await DB.messages.get(messageID);
		if (oldMessage) {
			let messageData = {};
			let tempPeerTypeBool = oldMessage.message.peerType === `chat`;
			if (oldMessage.messageFullData.geo) {
				messageData = Object.assign(messageData, {
					lat: oldMessage.messageFullData.geo.coordinates.latitude,
					long: oldMessage.messageFullData.geo.coordinates.longitude,
				});
			}
			let tempMessageText = `Удалено сообщение пользователя @id${
				oldMessage.message.senderId
			} #${oldMessage.message.id} ${
				tempPeerTypeBool
					? `в беседе #${oldMessage.message.peerId - 2000000000}`
					: ``
			} от ${await utils.time.getDateTimeByMS(
				oldMessage.message.createdAt * 1000,
			)}\nТекст сообщения: ${oldMessage.message.text}`;
			let tempAttachmentsData = await groupLogger.uploadAttachmentsToVK(
				oldMessage.messageFullData.attachments || [],
				tempPeerTypeBool ? 2000000001 : 2000000002,
			);
			messageData = Object.assign(messageData, {
				attachment: tempAttachmentsData,
				message: tempMessageText,
			});
			return tempPeerTypeBool
				? await groupLogger.sendInConversationsLogs(messageData)
				: await groupLogger.sendInMessagesLogs(messageData);
		} else {
			return;
		}
	},
	processByDialogFlags: async (message: ModernUserMessageContext) => {
		switch (message.flags) {
			case 17408:
				let sortedBombMessages = bombMessages.filter(
					(x) => x.peer_id === message.peerId,
				);
				let sortedBombMessagesByDate = sortedBombMessages.filter(
					(x) => x.expiryDate < new Date(),
				);
				for (let bombMessage of sortedBombMessagesByDate) {
					await internal.logBombMessagesDeleted(bombMessage.id);
					bombMessages.splice(
						bombMessages.findIndex((x) => x.id === bombMessage.id),
						1,
					);
				}
				console.log(bombMessages);
			case 131200:
				let checkSaveMessage = await DB.messages.exist(message.id);
				if (checkSaveMessage) {
					let oldMessage = await DB.messages.get(message.id);
					if (oldMessage) {
						await internal.logMessageDeletion(oldMessage);
					}
				}
		}
	},
};

userVK.updates.use(async (message: ModernUserMessageContext) => {
	if (
		(await internal.filterTypes(message)) === true ||
		message.senderId === -config.vk.group.id
	) {
		return;
	}

	if (message.text) {
		message.text = await internal.filterWords(message.text);
	}

	if (message.isOutbox === true) {
		try {
			let command = userCommands.find((x) => x.regexp.test(message.text || ""));
			if (!command) {
				return;
			} else {
				try {
					await userVK.api.messages.delete({
						message_ids: message.id,
						delete_for_all: 1,
					});
				} catch (autoDeleteError) {
					// TODO add handle error
				}
			}
			message.sendMessage = async (
				text: string | IMessageContextSendOptions,
				params?: IMessageContextSendOptions | undefined,
			): Promise<MessageContext<Record<string, any>>> => {
				try {
					let paramsForSend = Object.assign({ disable_mentions: true }, params);
					return await message.send(
						`@id${message.senderId}, ${text}`,
						paramsForSend,
					);
				} catch (error) {
					console.log(error);
					return error;
				}
			};
			if (message.text) {
				message.args = message.text.match(command.regexp);
			}
			await command.process(message);
			return;
		} catch (err) {
			await message.sendMessage(`ошиб очка.`);
			await message.send({
				sticker_id: await utils.array.random([
					18464,
					16588,
					18466,
					18484,
					14088,
				]),
			});
			console.log(err);
			return;
		}
	}

	await internal.processByDialogFlags(message);

	if (message.updatedAt !== 0) {
		let checkSaveMessage = await DB.messages.exist(message.id);
		if (checkSaveMessage) {
			let oldMessage = await DB.messages.get(message.id);
			if (oldMessage) {
				await internal.logMessageEditing(message, oldMessage);
			}
		}
	}

	if (message.id) {
		let messageData = (
			await userVK.api.messages.getById({
				message_ids: message.id,
			})
		).items[0];

		if (messageData && messageData.expire_ttl) {
			if (
				!bombMessages.find(
					(x) =>
						x.id === message.id &&
						x.peer_id === message.peerId &&
						x.ttl === messageData.expire_ttl,
				)
			) {
				bombMessages.push({
					id: message.id,
					peer_id: message.peerId,
					ttl: messageData.expire_ttl,
					expiryDate: new Date(
						Number(new Date()) + messageData.expire_ttl * 1000,
					),
				});
			}
		}

		try {
			await DB.messages.save(message.id, {
				message: message,
				messageFullData: messageData,
			});
		} catch (error) {
			await groupLogger.logInErrorLogs(
				`Error on save message #${message.id}\nError: ${error.name}\n\nError Data: ${error.message}`,
			);
		}
	}
});

export { userVK };

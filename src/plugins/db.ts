import { MessagesMessage } from "vk-io/lib/api/schemas/objects";
import { MessageContext } from "vk-io";
import { messageDataBase } from "./types";
import fs from "fs";
import { config } from "./core";

const internal = {
	parseMessageToDB: async function (message: {
		message: MessageContext;
		messageFullData: MessagesMessage;
	}): Promise<messageDataBase> {
		return {
			message: {
				id: message.message.id,
				peerId: message.message.peerId,
				peerType: message.message.peerType,
				senderId: message.message.senderId,
				createdAt: message.message.createdAt,
				updatedAt: message.message.updatedAt,
				text: message.message.text,
				forwards: message.message.forwards,
				attachments: message.message.attachments,
				isOutbox: message.message.isOutbox,
				type: message.message.type,
				subTypes: message.message.subTypes,
			},
			messageFullData: message.messageFullData,
		};
	},
};

export const DB = {
	messages: {
		exist: async function (messageID: number) {
			return fs.existsSync(`./DB/temp/messages/${messageID}.json`);
		},
		get: async function (messageID: number): Promise<messageDataBase> {
			return JSON.parse(
				fs.readFileSync(`./DB/temp/messages/${messageID}.json`).toString(),
			);
		},
		save: async function (
			messageID: number,
			message: {
				message: MessageContext;
				messageFullData: MessagesMessage;
			},
		) {
			return fs.writeFileSync(
				`./DB/temp/messages/${messageID}.json`,
				JSON.stringify(await internal.parseMessageToDB(message)),
			);
		},
		delete: async function (messageID: number) {
			return fs.unlinkSync(`./DB/temp/messages/${messageID}.json`);
		},
	},
	config: {
		save: async function () {
			return fs.writeFileSync(
				`./DB/config.json`,
				JSON.stringify(config, null, `\t`),
			);
		},
	},
};

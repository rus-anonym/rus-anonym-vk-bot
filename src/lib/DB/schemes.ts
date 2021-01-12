import { createSchema, Type } from "ts-mongoose";

const entityTypes = ["user", "chat", "group"] as const;

const user = createSchema({});

const chat = createSchema({});

const message = createSchema({
	id: Type.number({ required: true, unique: true }),
	events: Type.array({ required: true }).of(
		Type.object({ required: true }).of({
			id: Type.number({ required: true }),
			conversationMessageId: Type.number({ required: true }),
			peerId: Type.number({ required: true }),
			peerType: Type.string({ required: true, enum: entityTypes }),
			senderId: Type.number({ required: true }),
			senderType: Type.string({
				required: true,
				enum: entityTypes,
			}),
			createdAt: Type.number({ required: true }),
			updatedAt: Type.number({ required: true }),
			text: Type.string({ required: true }),
			forwards: Type.array({ required: true }).of({}),
			attachments: Type.array({ required: true }).of({}),
			isOutbox: Type.boolean({ required: true }),
			type: "message",
		}),
	),
	messageData: Type.array({ required: true }).of(
		Type.object({
			date: Type.date({ required: true }),
			peerId: Type.number({ required: true }),
			forwards: Type.array({ required: true }).of(Type.mixed()),
			replyMessage: Type.array({ required: true }).of(Type.mixed()),
			attachments: Type.array({ required: true }).of({}),
			isOutbox: Type.boolean({ required: true }),
		}),
	),
});

export { user, chat, message };

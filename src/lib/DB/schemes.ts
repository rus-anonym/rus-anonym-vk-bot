import { createSchema, Type } from "ts-mongoose";

const entityTypes = ["user", "chat", "group"] as const;

const user = createSchema({
	id: Type.number({ required: true, unique: true }),
	messages: Type.array({ required: true }).of(Type.number({ required: true })),
	vk: {
		name: Type.string({ required: true }),
		surname: Type.string({ required: true }),
	},
});

const chat = createSchema({
	id: Type.number({ required: true }),
	messages: Type.array({ required: true }).of(Type.number({ required: true })),
	creator: Type.number({ required: true }),
	data: {
		members: Type.array({ required: true }).of(Type.number({ required: true })),
		users: Type.number({ required: true }),
		bots: Type.number({ required: true }),
		title: Type.string({ required: true }),
	},
});

const message = createSchema({
	id: Type.number({ required: true, unique: true }),
	conversationMessageId: Type.number({ required: true }),
	peerId: Type.number({ required: true }),
	peerType: Type.string({ required: true, enum: entityTypes }),
	senderId: Type.number({ required: true }),
	senderType: Type.string({ required: true, enum: entityTypes }),
	created: Type.date({ required: true }),
	updated: Type.date({ required: true }),
	isOutbox: Type.boolean({ required: true }),
	events: Type.array({ required: true }).of({
		updatedAt: Type.number({ required: true }),
		text: Type.string({ required: true }),
		attachments: Type.array({ required: true }).of(
			Type.string({ required: true }),
		),
		type: Type.string({ required: true }),
		subTypes: Type.array({ required: true }).of(
			Type.string({ required: true }),
		),
		hasReply: Type.boolean({ required: true }),
		hasForwards: Type.boolean({ required: true }),
	}),
	data: Type.array({ required: true }).of(Type.mixed({ required: true })),
});

export default { user, chat, message };

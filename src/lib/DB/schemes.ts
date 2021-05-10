import { createSchema, Type } from "ts-mongoose";

const entityTypes = ["user", "chat", "group"];

const user = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		messages: Type.array({ required: true }).of(
			Type.number({ required: true }),
		),
		personalMessages: Type.array({ required: true }).of(
			Type.number({ required: true }),
		),
		updateDate: Type.date({ required: true }),
		regDate: Type.date({ required: true }),
	},
	{
		versionKey: false,
	},
);

const chat = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		messages: Type.array({ required: true }).of(
			Type.number({ required: true }),
		),
		updateDate: Type.date({ required: true }),
		regDate: Type.date({ required: true }),
	},
	{
		versionKey: false,
	},
);

const event = createSchema(
	{
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
	},
	{
		versionKey: false,
		_id: false,
	},
);

const message = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		conversationMessageId: Type.number({ required: true }),
		peerId: Type.number({ required: true }),
		peerType: Type.string({ required: true, enum: entityTypes }),
		senderId: Type.number({ required: true }),
		senderType: Type.string({ required: true, enum: entityTypes }),
		created: Type.date({ required: true }),
		updated: Type.date({ required: true }),
		isOutbox: Type.boolean({ required: true }),
		events: Type.array({ required: true }).of(event),
		data: Type.array({ required: true }).of(Type.mixed({ required: true })),
	},
	{
		versionKey: false,
	},
);

export default { user, chat, message };

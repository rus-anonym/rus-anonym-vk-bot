import { createSchema, Type } from "ts-mongoose";

const entityTypes = ["user", "chat", "group"];

const user = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		info: Type.object({ required: true }).of({
			name: Type.string({ required: true }),
			surname: Type.string({ required: true }),
			gender: Type.number({ required: true }),
			last_seen: Type.object().of({
				date: Type.date({ required: true }),
				isOnline: Type.boolean({ required: true }),
			}),
			extends: Type.object({ required: true }).of({
				name_nom: Type.string({ required: true }),
				name_gen: Type.string({ required: true }),
				name_dat: Type.string({ required: true }),
				name_acc: Type.string({ required: true }),
				name_ins: Type.string({ required: true }),
				name_abl: Type.string({ required: true }),
				surname_nom: Type.string({ required: true }),
				surname_gen: Type.string({ required: true }),
				surname_dat: Type.string({ required: true }),
				surname_acc: Type.string({ required: true }),
				surname_ins: Type.string({ required: true }),
				surname_abl: Type.string({ required: true }),
				domain: Type.string({ required: true }),
				photo_max_orig: Type.string({ required: true }),
				status: Type.string(),
			}),
			isBot: Type.boolean({ required: true }),
			isTrack: Type.boolean({ required: true }),
			full: Type.object({ default: {} }).of({
				settings: Type.object({ required: true, default: {} }).of({
					getAudios: Type.boolean({ required: true, default: true }),
				}),
				friends: Type.array({ required: true, default: [] }).of(Type.number()),
				hiddenFriends: Type.array({ required: true, default: [] }).of(
					Type.number(),
				),
				groups: Type.array({ required: true, default: [] }).of(Type.number()),
				audios: Type.array({ required: true, default: [] }).of(Type.number()),
			}),
			lastUpdate: Type.date({ required: true }),
		}),
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
		minimize: false,
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
		isDeleted: Type.boolean({ required: true }),
		isDeletedForAll: Type.boolean({ required: true }),
		events: Type.array({ required: true }).of(event),
		data: Type.array({ required: true }).of(Type.mixed({ required: true })),
	},
	{
		versionKey: false,
	},
);

export default { user, chat, message };

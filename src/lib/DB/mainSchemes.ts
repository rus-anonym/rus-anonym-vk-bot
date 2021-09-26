import { createSchema, Type } from "ts-mongoose";

const aliasScheme = createSchema(
	{
		trigger: Type.string({ required: true }),
		text: Type.string(),
		attachments: Type.array({ required: true }).of(
			Type.string({ required: true }),
		),
		sendNewMessage: Type.boolean({ required: true }),
	},
	{
		versionKey: false,
		_id: false,
	},
);

const config = createSchema(
	{
		exceptions: Type.object({ required: true }).of({
			dontImproveText: Type.array({ required: true }).of(
				Type.number({ required: true }),
			),
		}),
		slaveStatus: Type.boolean({ required: true }),
		slaveAccessList: Type.array({ required: true }).of(
			Type.number({ required: true }),
		),
		textAliases: Type.array({ required: true }).of(aliasScheme),
		friendsList: Type.array({ required: true }).of(Type.number()),
	},
	{
		versionKey: false,
	},
);

const reserveGroup = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		domain: Type.string({ required: true }),
		isReserve: Type.boolean({ required: true }),
		ownerId: Type.number({ required: true }),
	},
	{
		versionKey: false,
	},
);

export default { reserveGroup, config, aliasScheme };

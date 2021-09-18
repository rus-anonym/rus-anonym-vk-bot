import { createSchema, Type } from "ts-mongoose";

const config = createSchema(
	{
		exceptions: Type.object({ required: true }).of({
			dontImproveText: Type.array({ required: true }).of(
				Type.number({ required: true }),
			),
		}),
		slaveAccessList: Type.array({ required: true }).of(
			Type.number({ required: true }),
		),
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

export default { reserveGroup, config };

import { createSchema, Type } from "ts-mongoose";

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

export default { reserveGroup };

import { createSchema, Type } from "ts-mongoose";

const user = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		nickname: Type.string({ required: true }),
		regDate: Type.date({ required: true, default: Date.now }),
		isMailingAllowed: Type.boolean({ required: true }),
		regGroupId: Type.number({ required: true }),
	},
	{
		versionKey: false,
	},
);

export default { user };

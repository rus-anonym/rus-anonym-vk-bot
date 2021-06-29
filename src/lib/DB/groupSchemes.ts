import { createSchema, Type } from "ts-mongoose";

const user = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		regDate: Type.date({ required: true, default: Date.now }),
	},
	{
		versionKey: false,
	},
);

export default { user };

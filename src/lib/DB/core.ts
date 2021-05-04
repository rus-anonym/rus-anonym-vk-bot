import { typedModel } from "ts-mongoose";
import mongoose from "mongoose";

import config from "../../DB/config.json";
import schemes from "./schemes";
class DB {
	public config = config;

	public connection = mongoose.createConnection(
		`mongodb+srv://${config.db.mongo.login}:${config.db.mongo.password}@${config.db.mongo.address}/${config.db.mongo.db}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		},
	);

	public models = {
		message: typedModel(
			"message",
			schemes.message,
			"messages",
			undefined,
			undefined,
			this.connection,
		),
		user: typedModel(
			"user",
			schemes.user,
			"users",
			undefined,
			undefined,
			this.connection,
		),
		chat: typedModel(
			"chat",
			schemes.chat,
			"chats",
			undefined,
			undefined,
			this.connection,
		),
	};
}

export default new DB();

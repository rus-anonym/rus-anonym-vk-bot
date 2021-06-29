import { typedModel } from "ts-mongoose";
import mongoose from "mongoose";

import config from "../../DB/config.json";
import userSchemes from "./userSchemes";
import groupSchemes from "./groupSchemes";

mongoose.Schema.Types.String.checkRequired((text) => text !== null);

abstract class DB {
	abstract connection: unknown;
	abstract models: unknown;
	abstract schemes: unknown;
}

class UserDB extends DB {
	public connection = mongoose.createConnection(
		`mongodb+srv://${config.db.mongo.user.login}:${config.db.mongo.user.password}@${config.db.mongo.user.address}/${config.db.mongo.user.db}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		},
	);

	public models = {
		message: typedModel(
			"message",
			userSchemes.message,
			"messages",
			undefined,
			undefined,
			this.connection,
		),
		user: typedModel(
			"user",
			userSchemes.user,
			"users",
			undefined,
			undefined,
			this.connection,
		),
		chat: typedModel(
			"chat",
			userSchemes.chat,
			"chats",
			undefined,
			undefined,
			this.connection,
		),
	};

	public schemes = userSchemes;
}

class GroupDB extends DB {
	public connection = mongoose.createConnection(
		`mongodb+srv://${config.db.mongo.group.login}:${config.db.mongo.group.password}@${config.db.mongo.group.address}/${config.db.mongo.group.db}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		},
	);

	public models = {
		user: typedModel(
			"user",
			groupSchemes.user,
			"users",
			undefined,
			undefined,
			this.connection,
		),
	};

	public schemes = groupSchemes;
}

class CoreDB {
	public config = config;

	public user = new UserDB();
	public group = new GroupDB();
}

const DataBase = new CoreDB();

export default DataBase;

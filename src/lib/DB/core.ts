import { typedModel } from "ts-mongoose";
import mongoose from "mongoose";

import config from "../../DB/config.json";
import constants from "../../DB/constants.json";
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
		`mongodb+srv://${config.DBMS.mongo.login}:${config.DBMS.mongo.password}@${config.DBMS.mongo.address}/${config.DBMS.mongo.database.user.name}`,
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
		`mongodb+srv://${config.DBMS.mongo.login}:${config.DBMS.mongo.password}@${config.DBMS.mongo.address}/${config.DBMS.mongo.database.group.name}`,
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

class MainDB extends DB {
	public connection = mongoose.createConnection(
		`mongodb+srv://${config.DBMS.mongo.login}:${config.DBMS.mongo.password}@${config.DBMS.mongo.address}/${config.DBMS.mongo.database.main.name}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		},
	);

	public models = {};
	public schemes = {};
}

class CoreDB {
	public config = config;
	public constants = constants;

	public user = new UserDB();
	public group = new GroupDB();
	public main = new MainDB();
}

const DataBase = new CoreDB();

export default DataBase;

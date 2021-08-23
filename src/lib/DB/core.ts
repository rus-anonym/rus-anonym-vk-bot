import { typedModel } from "ts-mongoose";
import mongoose, { ConnectionOptions } from "mongoose";

import config from "../../DB/config.json";
import constants from "../../DB/constants.json";

import mainSchemes from "./mainSchemes";
import userSchemes from "./userSchemes";
import groupSchemes from "./groupSchemes";

mongoose.Schema.Types.String.checkRequired((text) => text !== null);

const mongoDbAddress = `mongodb://${config.DBMS.mongo.address}:27017/`;

const buildConnectionConfig = (dbName: string): ConnectionOptions => {
	return {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		auth: {
			user: config.DBMS.mongo.login,
			password: config.DBMS.mongo.password,
		},
		authSource: "admin",
		dbName: dbName,
	};
};

abstract class DB {
	abstract connection: unknown;
	abstract models: unknown;
	abstract schemes: unknown;
}

class UserDB extends DB {
	public connection = mongoose.createConnection(
		mongoDbAddress,
		buildConnectionConfig(config.DBMS.mongo.database.user.name),
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
		mongoDbAddress,
		buildConnectionConfig(config.DBMS.mongo.database.group.name),
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
		mongoDbAddress,
		buildConnectionConfig(config.DBMS.mongo.database.main.name),
	);

	public models = {
		reserveGroup: typedModel(
			"reserveGroup",
			mainSchemes.reserveGroup,
			"reserve-groups",
			undefined,
			undefined,
			this.connection,
		),
	};
	public schemes = mainSchemes;
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

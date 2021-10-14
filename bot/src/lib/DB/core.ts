import { ExtractDoc, typedModel } from "ts-mongoose";
import mongoose, { ConnectOptions } from "mongoose";

import config from "../../DB/config";
import IConfig from "../../DB/IConfig";
import constants from "../../DB/constants.json";

import mainSchemes from "./mainSchemes";
import userSchemes from "./userSchemes";
import groupSchemes from "./groupSchemes";

mongoose.Schema.Types.String.checkRequired((text) => text !== null);

const mongoDbAddress = `mongodb://${config.DBMS.mongo.address}:27017/`;

const buildConnectionConfig = (dbName: string): ConnectOptions => {
	return {
		auth: {
			username: config.DBMS.mongo.login,
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

class MainConfig {
	public data!: ExtractDoc<typeof mainSchemes.config>;

	constructor(main: MainDB) {
		main.models.config.findOne({}).then((res) => {
			if (res) {
				this.data = res;
			}
		});
	}
}

class MainDB extends DB {
	public connection = mongoose.createConnection(
		mongoDbAddress,
		buildConnectionConfig(config.DBMS.mongo.database.main.name),
	);

	public models = {
		config: typedModel(
			"config",
			mainSchemes.config,
			"config",
			undefined,
			undefined,
			this.connection,
		),
		reserveGroup: typedModel(
			"reserveGroup",
			mainSchemes.reserveGroup,
			"reserve-groups",
			undefined,
			undefined,
			this.connection,
		),
		vkConversation: typedModel(
			"conversation",
			mainSchemes.conversation,
			"vk-conversations",
			undefined,
			undefined,
			this.connection,
		),
	};

	public schemes = mainSchemes;

	public config = new MainConfig(this);
}

class CoreDB {
	public readonly config: IConfig = Object.freeze(config);
	public readonly constants = Object.freeze(constants);

	public temp: {
		verification: {
			slave: {
				apiHash: string;
				hash: string;
			};
		};
		user: {
			master: {
				eval: Record<string, unknown>;
			};
		};
		[key: string]: unknown;
	} = {
		verification: {
			slave: {
				apiHash: "",
				hash: "",
			},
		},
		user: {
			master: {
				eval: {},
			},
		},
	};

	public user = new UserDB();
	public group = new GroupDB();
	public main = new MainDB();
}

const DataBase = new CoreDB();

export default DataBase;

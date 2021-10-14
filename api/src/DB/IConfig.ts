export interface IConfigDBMSMongoDatabaseParams {
	name: string;
}

export interface IConfigDBMSMongoDatabase {
	user: IConfigDBMSMongoDatabaseParams;
	group: IConfigDBMSMongoDatabaseParams;
	main: IConfigDBMSMongoDatabaseParams;
}

export interface IConfigDBMSMongo {
	login: string;
	password: string;
	address: string;
	database: IConfigDBMSMongoDatabase;
}

export interface IConfigDBMS {
	mongo: IConfigDBMSMongo;
}

export default interface IConfig {
	DBMS: IConfigDBMS;
}

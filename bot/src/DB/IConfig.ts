export interface IConfigVK {
	user: IConfigUser;
	userFakes: IConfigUserFake[];
	group: IConfigGroup;
	subGroups: IConfigSubGroup[];
	groupReposts: IConfigGroupReposts;
}

export interface IConfigUser {
	master: IConfigMaster;
	slave: IConfigSlave;
}

export interface IConfigMaster {
	id: number;
	login: string;
	password: string;
	tokens: IConfigTokens;
	friends: IConfigMasterFriends;
}

export interface IConfigTokens {
	main: string;
	additional: string[];
	apps: IConfigTokensApps;
}

export interface IConfigTokensApps {
	6146827: string;
}

export interface IConfigMasterFriends {
	list: IConfigMasterFriendsList;
}

export interface IConfigMasterFriendsList {
	viewOnline: number[];
}

export interface IConfigSlave {
	id: number;
	login: string;
	password: string;
	tokens: IConfigTokens;
}

export interface IConfigUserFake {
	id: number;
	login: string;
	password: string;
	tokens: string[];
}

export interface IConfigGroup {
	id: number;
	tokens: IGroupTokens;
	logs: IConfigGroupLogs;
	conversations: number[];
}

export interface IConfigSubGroup {
	id: number;
	tokens: IGroupTokens;
}

export interface IGroupTokens {
	main: string;
	additional: string[];
}

export interface IConfigGroupLogs {
	conversations: IConfigGroupLogsConversations;
}

export interface IConfigGroupLogsConversations {
	messages: number;
	conversations: number;
	rest: number;
	errors: number;
	info: number;
	userTrack: number;
	captcha: number;
	api: number;
	conversationsTrack: number;
}

export interface IConfigGroupReposts {
	tokens: IConfigGroupRepostsToken[];
	chats: number[];
}

export interface IConfigGroupRepostsToken {
	id: number;
	token: string;
}

export interface IConfigDBMS {
	mongo: IConfigDBMSMongo;
}

export interface IConfigDBMSMongo {
	login: string;
	password: string;
	address: string;
	database: IConfigDBMSMongoDatabase;
}

export interface IConfigDBMSMongoDatabase {
	user: IConfigDBMSMongoDatabaseParams;
	group: IConfigDBMSMongoDatabaseParams;
	main: IConfigDBMSMongoDatabaseParams;
}

export interface IConfigDBMSMongoDatabaseParams {
	name: string;
}

export interface IConfigRuCaptcha {
	token: string;
}

export default interface IConfig {
	VK: IConfigVK;
	DBMS: IConfigDBMS;
	rucaptcha: IConfigRuCaptcha;
	paymentDetails: Record<string, string>;
}

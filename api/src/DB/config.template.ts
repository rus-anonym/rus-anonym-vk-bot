import IConfig from "./IConfig";

const config: IConfig = {
	DBMS: {
		mongo: {
			login: "", // Mongo DB login
			password: "", // Mongo DB password
			address: "", // Adress to MongoDB
			database: {
				user: {
					name: "", // UserBot database name
				},
				group: {
					name: "", // GroupBot database name
				},
				main: {
					name: "", // Main database name
				},
			},
		},
	},
};

export default config;

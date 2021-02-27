import config from "../../DB/config.json";
import * as utils from "rus-anonym-utils";
import mongoose from "mongoose";
import Schemes from "./schemes";
import Models from "./models";

mongoose.Schema.Types.String.checkRequired((v) => v != null);

export default {
	connect: async function connectDataBase(): Promise<boolean> {
		try {
			await mongoose.connect(
				`mongodb+srv://${config.mongoose.user}:${config.mongoose.password}@${config.mongoose.address}/${config.mongoose.database}?retryWrites=true&w=majority`,
				{
					useCreateIndex: true,
					useNewUrlParser: true,
					useUnifiedTopology: true,
				},
			);
			utils.logger.info("Successful connect to database");
			return true;
		} catch (error) {
			utils.logger.info("Connect to database");
			return false;
		}
	},
	schemes: Schemes,
	models: Models,
	config: config,
};

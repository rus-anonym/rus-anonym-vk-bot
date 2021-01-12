import config from "../../DB/config.json";
import * as utils from "rus-anonym-utils";
import mongoose from "mongoose";

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

	config: config,
};
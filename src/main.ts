import DataBase from "./lib/DB/core";
import * as VKCore from "./lib/VK/core";
import * as utils from "rus-anonym-utils";

import "./lib/VK/middlewares/user/message";

(async function start() {
	utils.logger.info("Loading");
	await DataBase.connect();
	await VKCore.startPolling();
	utils.logger.info("Succesfull load");
})();

import DataBase from "./lib/DB/core";
import * as VKCore from "./lib/VK/core";
import * as utils from "rus-anonym-utils";
import commands from "./lib/commands";

import "./lib/VK/middlewares/user/message";

(async function start() {
	utils.logger.info("Loading");
	await DataBase.connect();
	commands.loadCommands();
	await VKCore.startPolling();
	utils.logger.info("Succesfull load");
})();

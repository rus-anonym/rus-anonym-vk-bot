import { userVK } from "./plugins/userVK";
import { groupVK } from "./plugins/groupVK";
import * as core from "./plugins/core";
import utils from "rus-anonym-utils";

(async function () {
	await userVK.updates.start();
	await groupVK.updates.start();
	await core.loadCommands();
	await utils.logger.console(`started`);
})();

import { userVK } from "./plugins/userVK";
import { groupVK } from "./plugins/groupVK";
import utils from "rus-anonym-utils";

(async function () {
	await userVK.updates.start();
	await groupVK.updates.start();
	await utils.logger.console(`started`);
})();

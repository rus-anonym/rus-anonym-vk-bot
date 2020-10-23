import { userVK } from "./plugins/userVK";
import utils from "rus-anonym-utils";

(async function () {
	await userVK.updates.start();
	await utils.logger.console(`started`);
})();

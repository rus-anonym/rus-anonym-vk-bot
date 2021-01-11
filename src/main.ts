import DataBase from "./lib/DB/core";
import * as VKCore from "./lib/VK/core";

import "./lib/VK/middlewares/user/message";

(async function start() {
	await VKCore.startPolling();
	await DataBase.connect();
})();

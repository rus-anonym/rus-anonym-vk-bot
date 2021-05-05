import moment from "moment";
moment.locale("ru");

import VK from "./VK/core";
import DB from "./DB/core";
import InternalUtils from "./utils/core";

DB.connection.once("open", function MongoDBConnected() {
	InternalUtils.logger.send(
		`Script start at ${moment().format("HH:mm:ss.SSS | DD.MM.YYYY")}`,
	);
	VK.user.main.updates.start().then(() => {
		InternalUtils.logger.send(
			`VK User polling start at ${moment().format(
				"HH:mm:ss.SSS | DD.MM.YYYY",
			)}`,
		);
	});
	VK.group.main.updates.start().then(() => {
		InternalUtils.logger.send(
			`VK Group polling start at ${moment().format(
				"HH:mm:ss.SSS | DD.MM.YYYY",
			)}`,
		);
	});
});

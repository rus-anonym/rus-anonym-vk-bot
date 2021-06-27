import moment from "moment";
moment.locale("ru");

import VK from "./VK/core";
import DB from "./DB/core";
import InternalUtils from "./utils/core";

import "./commands/loader";

DB.connection.once("open", function MongoDBConnected() {
	InternalUtils.logger.send(
		`Connect to DB at ${moment().format("HH:mm:ss.SSS | DD.MM.YYYY")}`,
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

process.on("warning", async (warning) => {
	InternalUtils.logger.send(
		`Unhandled warning\n${warning.toString()}`,
		"error",
	);
});
process.on("uncaughtException", async (error) => {
	InternalUtils.logger.send(
		`Unhandled uncaughtException\n${error.toString()}`,
		"error",
	);
});

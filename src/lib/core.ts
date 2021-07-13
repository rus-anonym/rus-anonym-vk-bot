import moment from "moment";

moment.locale("ru");

import VK from "./VK/core";
import DB from "./DB/core";
import InternalUtils from "./utils/core";

import "./scheduler/core";
import "./commands/loader";

DB.user.connection.once("open", () => {
	InternalUtils.logger.send(
		`Connect to UserBot DB at ${moment().format("HH:mm:ss.SSS | DD.MM.YYYY")}`,
	);
	VK.user.main.updates.start().then(() => {
		InternalUtils.logger.send(
			`VK User polling start at ${moment().format(
				"HH:mm:ss.SSS | DD.MM.YYYY",
			)}`,
		);
	});
});

DB.group.connection.once("open", () => {
	InternalUtils.logger.send(
		`Connect to GroupBot DB at ${moment().format("HH:mm:ss.SSS | DD.MM.YYYY")}`,
	);
	VK.group.main.updates.start().then(() => {
		InternalUtils.logger.send(
			`VK Group polling start at ${moment().format(
				"HH:mm:ss.SSS | DD.MM.YYYY",
			)}`,
		);
	});
});

process.on("warning", async (warning) => {
	InternalUtils.logger
		.send(`Unhandled warning\n${warning.toString()}`, "error")
		.catch(() => {
			console.log(warning);
		});
});
process.on("uncaughtException", async (error) => {
	InternalUtils.logger
		.send(`Unhandled uncaughtException\n${error.toString()}`, "error")
		.catch(() => {
			console.log(error);
		});
});

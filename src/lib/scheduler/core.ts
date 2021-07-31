import scheduler from "simple-scheduler-task";

import InternalUtils from "../utils/core";

// import updateUserData from "./tasks/updateUsersData";
import cleanOldMessages from "./tasks/cleanOldMessages";
import getBirthdays from "./tasks/getBirthdays";
import updateOnlinePrivacySettings from "./tasks/updateOnlinePrivacySettings";
import deleteSameAudios from "./tasks/deleteSameAudios";
import deleteSameDocuments from "./tasks/deleteSameDocuments";
import sendHappyBirthdayGreetings from "./tasks/sendHappyBirthdayGreetings";

scheduler.events.on("error", (error) => {
	InternalUtils.logger.send({
		message: `Ошибка при выполнении запланированной задачи:
Тип: ${error.task.type}
Error: ${error.error.toString()}`,
		type: "error",
	});
});

export default {
	// updateUserData,
	cleanOldMessages,
	getBirthdays,
	deleteSameAudios,
	updateOnlinePrivacySettings,
	sendHappyBirthdayGreetings,
	deleteSameDocuments,
};

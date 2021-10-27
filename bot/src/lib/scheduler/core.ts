import scheduler from "simple-scheduler-task";

import InternalUtils from "../utils/core";

import updateUserData from "./tasks/updateUsersData";
import cleanOldMessages from "./tasks/cleanOldMessages";
import getBirthdays from "./tasks/getBirthdays";
import updateOnlinePrivacySettings from "./tasks/updateOnlinePrivacySettings";
import deleteSameAudios from "./tasks/manageAudios";
import deleteSameDocuments from "./tasks/deleteSameDocuments";
import sendHappyBirthdayGreetings from "./tasks/sendHappyBirthdayGreetings";
import sendApiStatus from "./tasks/sendApiStatus";
import updateReserveGroupsList from "./tasks/updateReserveGroupsList";
import setSteps from "./tasks/setSteps";
import getNewConversations from "./tasks/getNewConversations";
import updateConversationsInfo from "./tasks/updateConversationsInfo";

scheduler.events.on("error", (error, meta) => {
	InternalUtils.logger.send({
		message: `Ошибка при выполнении запланированной задачи:
Тип: ${meta.type}
Error: ${error.toString()}`,
		type: "error",
	});
});

export default {
	updateUserData,
	cleanOldMessages,
	getBirthdays,
	deleteSameAudios,
	updateOnlinePrivacySettings,
	sendHappyBirthdayGreetings,
	deleteSameDocuments,
	sendApiStatus,
	updateReserveGroupsList,
	setSteps,
	getNewConversations,
	updateConversationsInfo,
};

import moment from "moment";

import InternalUtils from "../../utils/core";

async function getBirthdays(): Promise<string> {
	const users = await InternalUtils.user.getFriendsBirthday(new Date());
	return `Сегодня ${moment().format("DD.MM.YYYY")} день рождения празднуют:
${users.map((user, index) => {
	return `${index + 1}. @id${user.id}(${user.name} ${user.surname})`;
})}`;
}

export default getBirthdays;

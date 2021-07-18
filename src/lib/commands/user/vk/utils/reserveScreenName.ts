import { UserCommand } from "../../../../utils/lib/commands";
import InternalUtils from "../../../../utils/core";

new UserCommand(/(?:^!reserve)(?:\s(.*))$/i, async function (message) {
	try {
		await InternalUtils.user.reserveScreenName(message.args[1]);
		return await message.editMessage({
			message: `@${message.args[1]} зарезервирован`,
		});
	} catch (error) {
		return await message.editMessage({
			message: `Ошибка: ${error.toString()}`,
		});
	}
});

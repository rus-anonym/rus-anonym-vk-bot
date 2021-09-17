import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtils from "../../../../utils/core";

new UserCommand({
		regexp: /(?:^!reserve)(?:\s(.*))$/i, process: async function (message) {
			try {
				await InternalUtils.user.reserveScreenName(message.state.args[1]);
				return await message.editMessage({
					message: `@${message.state.args[1]} зарезервирован`,
				});
			} catch (error) {
				if (error.code === 17) {
					return await message.editMessage({
						message: `Ошибка: ${error.toString()}
URL: ${error.redirectUri}`,
					});
				} else {
					return await message.editMessage({
						message: `Ошибка: ${error.toString()}`,
					});
				}
			}
		}
	});

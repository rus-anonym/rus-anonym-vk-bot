import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand({
	regexp: /(?:^!moonToSun)$/i,
	process: async function (message) {
		const moon = `🌚🔪`;
		const sun = `🌝`;
		const blood = "🩸";
		const invisibleSymbol = `⠀⠀`;
		const maximal = 6;
		for (let i = 0; i <= maximal; ++i) {
			await message.editMessage({
				message: `${invisibleSymbol.repeat(i)}${moon}${invisibleSymbol.repeat(
					maximal - i,
				)}${i === maximal ? blood : sun}`,
			});
			await utils.sleep(1000);
		}
	},
});

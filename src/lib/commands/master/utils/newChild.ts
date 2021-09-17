import utils from "rus-anonym-utils";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand({
	regexp: /(?:^!newChild)$/i,
	process: async function (message) {
		const man = `🙍‍♂`;
		const woman = `🙎‍♀`;
		const pregnantWoman = "🤰";
		const child = "👶";
		const bread = "🍞";
		const sex = "👩‍❤‍👨 ";
		const invisibleSymbol = `⠀⠀`;
		const distance = 4;
		for (let i = 0; i <= distance; ++i) {
			await message.editMessage({
				message: `${invisibleSymbol.repeat(
					i + 1,
				)}${man}${invisibleSymbol.repeat(distance - i)}${woman}`,
			});
			await utils.sleep(1000);
		}
		await message.editMessage({
			message: `${invisibleSymbol.repeat(distance + 2)}${sex}`,
		});
		await utils.sleep(1000);
		for (let i = distance; i >= 0; --i) {
			await message.editMessage({
				message: `${bread}${invisibleSymbol.repeat(
					i,
				)}${man}${invisibleSymbol.repeat(distance - i)}${pregnantWoman}`,
			});
			await utils.sleep(1000);
		}
		await message.editMessage({
			message: `${bread}${man}${invisibleSymbol.repeat(
				distance,
			)}${child}${woman}`,
		});
	},
});

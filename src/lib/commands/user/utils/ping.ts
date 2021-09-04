import { promise as ping } from "ping";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/^ping ((?:.|\s)+)$/i, async function (message) {
	const { alive, output } = await ping.probe(message.state.args[1], {
		extra: ["-c", "4"],
	});

	if (!alive) {
		return await message.reply({
			message: `Status: Dead`,
		});
	} else {
		return await message.editMessage({
			message: output,
		});
	}
});

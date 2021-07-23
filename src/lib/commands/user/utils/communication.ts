import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!communication)$/i, async function (message) {
	return message.editMessage({
		attachment: "article266982306_105256_615f63354c650b4bbd",
	});
});

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand({
		regexp: /(?:^!communication)$/i, process: async function (message) {
			return message.editMessage({
				message: "",
				attachment: "article266982306_105256_615f63354c650b4bbd",
			});
		}
	});

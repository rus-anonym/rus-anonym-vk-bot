import { UserCommand } from "../../../utils/lib/commands/core";
import DB from "../../../DB/core";

new UserCommand({
		regexp: /^(?:реквизиты)$/i, process: async function (message) {
			return message.editMessage({
				message: Object.entries(DB.config.paymentDetails)
					.map((x) => x[0] + ": " + x[1])
					.join("\n"),
				dont_parse_links: true,
			});
		}
	});

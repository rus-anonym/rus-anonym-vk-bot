import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand({
	regexp: /(?:^ты александр с(ё|е)мин(\?)?)$/i,
	process: async (message) => {
		return message.editMessage({
			message: "",
			attachment: "photo266982306_457333063_b3389208f78f82b782",
		});
	},
});

new UserCommand({
	regexp: /(?:^да я александр с(ё|е)мин(!)?)$/i,
	process: async (message) => {
		return message.editMessage({
			message: "",
			attachment: "photo266982306_457333062_5e52efede720ec7848",
		});
	},
});

new UserCommand({
	regexp: /(?:^ты не александр с(ё|е)мин(!)?)$/i,
	process: async (message) => {
		return message.editMessage({
			message: "",
			attachment: "photo266982306_457333061_64a53fcb6ae8351629",
		});
	},
});

new UserCommand({
	regexp: /(?:^я александр с(ё|е)мин)$/i,
	process: async (message) => {
		return message.editMessage({
			message: "",
			attachment: "photo266982306_457333060_cb6e0a640af9422bf5",
		});
	},
});

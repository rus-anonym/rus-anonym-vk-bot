import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^ты александр с(ё|е)мин(\?)?)$/i, async (message) => {
	return message.editMessage({
		message: "",
		attachment: "photo266982306_457333063_b3389208f78f82b782",
	});
});

new UserCommand(/(?:^да я александр с(ё|е)мин(!)?)$/i, async (message) => {
	return message.editMessage({
		message: "",
		attachment: "photo266982306_457333062_5e52efede720ec7848",
	});
});

new UserCommand(/(?:^ты не александр с(ё|е)мин(!)?)$/i, async (message) => {
	return message.editMessage({
		message: "",
		attachment: "photo266982306_457333061_64a53fcb6ae8351629",
	});
});

new UserCommand(/(?:^я александр с(ё|е)мин)$/i, async (message) => {
	return message.editMessage({
		message: "",
		attachment: "photo266982306_457333060_cb6e0a640af9422bf5",
	});
});

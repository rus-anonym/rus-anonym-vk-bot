import axios from "axios";

import DB from "../../../../../DB/core";
import { GroupCommand } from "../../../../../utils/lib/commands/core";

new GroupCommand({
	isSelf: true,
	regexp: /(?:^init verify)$/i,
	process: async function (message) {
		if (
			DB.temp.verification.slave.apiHash === "" ||
			DB.temp.verification.slave.hash === ""
		) {
			return message.state.sendMessage("Валидация не требуется");
		}

		await axios({
			url: `https://m.vk.com/activation?act=validate_phone&api_hash=${DB.temp.verification.slave.apiHash}&hash=${DB.temp.verification.slave.hash}`,
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				"x-requested-with": "XMLHttpRequest",
			},
			data: `act=validate_phone&api_hash=${DB.temp.verification.slave.apiHash}&hash=${DB.temp.verification.slave.hash}`,
		});

		const answer = await message.question("Введите код: ", {
			answerTimeLimit: 60_000,
		});

		if (answer.isTimeout) {
			return message.state.sendMessage("Вы не успели ответить вовремя");
		}

		if (!answer.text) {
			return message.state.sendMessage("Нет текста");
		}

		await axios({
			url: `https://m.vk.com/activation?act=validate_code&api_hash=${DB.temp.verification.slave.apiHash}&hash=${DB.temp.verification.slave.hash}`,
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				"x-requested-with": "XMLHttpRequest",
			},
			data: `act=validate_code&api_hash=${DB.temp.verification.slave.apiHash}&hash=${DB.temp.verification.slave.hash}&code=${answer.text}`,
		});

		DB.temp.verification.slave.apiHash = "";
		DB.temp.verification.slave.hash = "";

		return message.state.sendMessage("Решено.");
	},
});

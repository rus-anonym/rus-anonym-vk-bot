import { createCollectIterator } from "vk-io";
import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";

import DB from "../../DB/core";
import VK from "../../VK/core";
import InternalUtils from "../../utils/core";

async function deleteSameAudios() {
	const audioIterator = createCollectIterator<{
		id: number;
		date: number;
		title: string;
		artist: string;
		url: string;
	}>({
		api: VK.user.getVK().api,
		method: "audio.get",
		params: {
			user_id: DB.staticConfig.VK.user.id,
		},
		countPerRequest: 5000,
	});

	const userAudios: {
		id: number;
		title: string;
		artist: string;
		date: Date;
		url: string;
	}[] = [];

	for await (const chunk of audioIterator) {
		for (const audio of chunk.items) {
			userAudios.push({
				id: audio.id,
				title: audio.title,
				artist: audio.artist,
				date: new Date(audio.date * 1000),
				url: InternalUtils.commands.parseAudioURL(audio.url),
			});
		}
	}

	const userAudiosUrls = userAudios.map((x) => x.url);
	const userAudiosUrlsWithoutDuplicates = [...new Set(userAudiosUrls)];

	let duplicates = [...userAudiosUrls];
	userAudiosUrlsWithoutDuplicates.forEach((item) => {
		const i = duplicates.indexOf(item);
		duplicates = duplicates
			.slice(0, i)
			.concat(duplicates.slice(i + 1, duplicates.length));
	});

	let log = `Найдено ${duplicates.length} дубликатов:\n`;

	for (const duplicate of duplicates) {
		const audios = userAudios.filter((x) => x.url === duplicate);
		audios.sort((a, b) => {
			if (a.date > b.date) {
				return 1;
			}
			if (a.date < b.date) {
				return -1;
			}
			return 0;
		});
		for (let i = 1; i < audios.length; i++) {
			await VK.user.getVK().api.call("audio.delete", {
				owner_id: DB.staticConfig.VK.user.id,
				audio_id: audios[i].id,
			});
		}
		log += `Удалил ${audios.length - 1} ${utils.string.declOfNum(
			audios.length - 1,
			["дубликат", "дубликата", "дубликатов"],
		)} трека ${audios[0].title} - ${audios[0].artist}\n`;
	}

	return log === `Найдено ${duplicates.length} дубликатов:\n` ? null : log;
}

export default new Interval({
	source: deleteSameAudios,
	type: "deleteSameAudios",
	cron: "0 0 * * *",
	onDone: (log) => {
		if (log.response) {
			InternalUtils.logger.send(
				{
					message: `deleteSameAudios:
${log.response} за ${log.executionTime}ms`, type: "info"
				},
			);
		}
	},
});

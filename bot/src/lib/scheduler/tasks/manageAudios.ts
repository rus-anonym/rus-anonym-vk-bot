import { createCollectIterator } from "vk-io";
import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";

import DB from "../../DB/core";
import VK from "../../VK/core";
import InternalUtils from "../../utils/core";

async function manageAudios() {
	const masterAudioIterator = createCollectIterator<{
		id: number;
		date: number;
		title: string;
		artist: string;
		url: string;
	}>({
		api: VK.master.getAPI(),
		method: "audio.get",
		params: {
			user_id: DB.config.VK.user.master.id,
		},
		countPerRequest: 5000,
	});

	const masterAudios: {
		id: number;
		title: string;
		artist: string;
		date: Date;
		url: string;
	}[] = [];

	for await (const chunk of masterAudioIterator) {
		for (const audio of chunk.items) {
			masterAudios.push({
				id: audio.id,
				title: audio.title,
				artist: audio.artist,
				date: new Date(audio.date * 1000),
				url: InternalUtils.commands.parseAudioURL(audio.url),
			});
		}
	}

	const masterAudiosUrls = masterAudios.map((x) => x.url);
	const masterAudiosUrlsWithoutDuplicates = [...new Set(masterAudiosUrls)];

	let duplicates = [...masterAudiosUrls];
	masterAudiosUrlsWithoutDuplicates.forEach((item) => {
		const i = duplicates.indexOf(item);
		duplicates = duplicates
			.slice(0, i)
			.concat(duplicates.slice(i + 1, duplicates.length));
	});

	let log = `Найдено ${duplicates.length} ${utils.string.declOfNum(
		duplicates.length - 1,
		["дубликат", "дубликата", "дубликатов"],
	)} дубликатов:\n`;

	for (const duplicate of [...new Set(duplicates)]) {
		const audios = masterAudios.filter((x) => x.url === duplicate);
		audios.sort((a, b) => {
			if (a.date > b.date) {
				return 1;
			}
			if (a.date < b.date) {
				return -1;
			}
			return 0;
		});
		for (let i = 0; i < audios.length - 1; ++i) {
			await VK.master.getAPI().call("audio.delete", {
				owner_id: DB.config.VK.user.master.id,
				audio_id: audios[i].id,
			});
		}
		log += `Удалил ${audios.length - 1} ${utils.string.declOfNum(
			audios.length - 1,
			["дубликат", "дубликата", "дубликатов"],
		)} трека ${audios[0].title} - ${audios[0].artist}\n`;
	}

	return duplicates.length === 0 ? null : log;
}

export default new Interval({
	isInform: true,
	source: manageAudios,
	type: "manageAudios",
	cron: "0 0 * * *",
	onDone: (log, meta) => {
		if (log) {
			InternalUtils.logger.send({
				message: `manageAudios:
${log} за ${meta.executionTime}ms`,
				type: "info",
			});
		}
	},
});

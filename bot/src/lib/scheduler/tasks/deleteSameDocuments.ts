import https from "https";
import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";

import DB from "../../DB/core";
import VK from "../../VK/core";
import InternalUtils from "../../utils/core";

const getDocumentUrl = (source: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		https.get(source, (res) => {
			if (res.headers.location) {
				return resolve(res.headers.location.split("?")[0]);
			} else {
				throw reject(new Error("URL not found"));
			}
		});
	});
};

async function deleteSameDocuments() {
	const userDocuments = (await VK.master.getAPI().docs.get({})).items;

	const userDocumentsParsed: {
		url: string;
		id: number;
		title: string;
		date: number;
	}[] = [];
	for (const document of userDocuments) {
		if (document.url) {
			userDocumentsParsed.push({
				url: await getDocumentUrl(document.url),
				id: document.id,
				title: document.title,
				date: document.date,
			});
		}
	}

	const userDocumentsUrls = userDocumentsParsed.map((x) => x.url);

	const userDocumentsUrlsWithoutDuplicates = [...new Set(userDocumentsUrls)];
	let duplicates = [...userDocumentsUrls];
	userDocumentsUrlsWithoutDuplicates.forEach((item) => {
		const i = duplicates.indexOf(item);
		duplicates = duplicates
			.slice(0, i)
			.concat(duplicates.slice(i + 1, duplicates.length));
	});

	let log = `Найдено ${duplicates.length} дубликатов:\n`;

	for (const duplicate of duplicates) {
		const documents = userDocumentsParsed.filter((x) => x.url === duplicate);
		documents.sort((a, b) => {
			if (a.date > b.date) {
				return 1;
			}
			if (a.date < b.date) {
				return -1;
			}
			return 0;
		});
		for (let i = 1; i < documents.length; i++) {
			await VK.master.getAPI().docs.delete({
				owner_id: DB.config.VK.user.master.id,
				doc_id: documents[i].id,
			});
		}
		log += `Удалил ${documents.length - 1} ${utils.string.declOfNum(
			documents.length - 1,
			["дубликат", "дубликата", "дубликатов"],
		)} файла ${documents[0].title}\n`;
	}

	return log === `Найдено ${duplicates.length} дубликатов:\n` ? null : log;
}

export default new Interval({
	isInform: true,
	source: deleteSameDocuments,
	type: "deleteSameDocuments",
	cron: "0 0 * * *",
	onDone: (log, meta) => {
		if (log) {
			InternalUtils.logger.send({
				message: `deleteSameDocuments:
${log} за ${meta.executionTime}ms`,
				type: "info",
			});
		}
	},
});

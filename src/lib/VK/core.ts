import { VK } from "vk-io";
import utils from "rus-anonym-utils";

import DB from "../DB/core";
import userMiddlewares from "./middlewares/user";

abstract class Worker {
	/**
	 * Основной инстанс вк ио который юзается для поллинга
	 */
	abstract main: VK;

	/**
	 * Дополнительные инстансы вк ио
	 */
	abstract additional: VK[];

	abstract configure(): this;

	/**
	 * Получение рандомного дополнительного инстанса
	 */
	public getVK(): VK {
		return utils.array.random(this.additional);
	}
}

class UserVK extends Worker {
	public main = new VK({ token: DB.config.vk.user.tokens[0] });

	public additional = DB.config.vk.user.tokens.splice(1).map((token) => {
		return new VK({ token });
	});

	public configure() {
		// this.main.updates.use((event, next) => {
		// 	console.log(event);
		// 	next();
		// });
		this.main.updates.on("message", userMiddlewares.messageHandler);
		this.main.updates.on("message_flags", userMiddlewares.messageFlagsHandler);
		return this;
	}
}

class GroupVK extends Worker {
	public main = new VK({ token: DB.config.vk.group.tokens[0] });

	public additional = DB.config.vk.group.tokens.splice(1).map((token) => {
		return new VK({ token });
	});

	public async uploadAttachments(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		attachments: any[],
		chat: number,
	): Promise<
		{
			link: string;
			type: string;
		}[]
	> {
		const response: {
			link: string;
			type: string;
		}[] = [];
		for (const attachment of attachments) {
			switch (attachment.type) {
				case "story": {
					const story = attachment.story;
					if (story.type === "photo") {
						story.photo.sizes.sort(
							(
								a: { width: number; height: number },
								b: { width: number; height: number },
							) => {
								if (a.width > b.width || a.height > b.height) {
									return -1;
								} else if (a.width < b.width || a.height < b.height) {
									return 1;
								} else {
									return 0;
								}
							},
						);

						const uploadedStory = await this.getVK().upload.messagePhoto({
							peer_id: 2e9 + chat,
							source: {
								value: story.photo.sizes[0].url,
							},
						});

						response.push({
							type: `История из фото ${story.is_one_time ? "(временная)" : ""}`,
							link: uploadedStory.toString(),
						});
					}

					if (story.type === "video") {
						const resolutionKeys = Object.keys(story.video.files);
						const resolutionArray = resolutionKeys.map((x) =>
							Number(x.split("_")[1]),
						);
						const maxResolution = utils.array.number.max(resolutionArray);

						const uploadedStory = await this.getVK().upload.messageDocument({
							peer_id: 2e9 + chat,
							source: {
								value:
									story.video.files[
										resolutionKeys[resolutionArray.indexOf(maxResolution)]
									],
								contentType: "video/mp4",
								filename: "video.mp4",
							},
						});

						response.push({
							type: `История из видео ${
								story.is_one_time ? "(временная)" : ""
							}`,
							link: uploadedStory.toString(),
						});
					}
					break;
				}
				case "photo": {
					const photo = attachment.photo;
					photo.sizes.sort(
						(
							a: { width: number; height: number },
							b: { width: number; height: number },
						) => {
							if (a.width > b.width || a.height > b.height) {
								return -1;
							} else if (a.width < b.width || a.height < b.height) {
								return 1;
							} else {
								return 0;
							}
						},
					);
					const maxResolutionPhoto = photo.sizes[0];

					const uploadedPhoto = await this.getVK().upload.messagePhoto({
						peer_id: 2e9 + chat,
						source: {
							value: maxResolutionPhoto.url,
						},
					});

					response.push({
						type: `Фотография (${maxResolutionPhoto.width} x ${maxResolutionPhoto.height})`,
						link: uploadedPhoto.toString(),
					});
					break;
				}
				case "video": {
					const video = attachment.video;

					const uploadedVideo = await this.getVK().upload.messageDocument({
						peer_id: 2e9 + chat,
						source: {
							value: video.files.src,
							filename: video.title,
						},
					});

					response.push({
						type: "Видео",
						link: uploadedVideo.toString(),
					});

					break;
				}
				case "audio": {
					const audio = attachment.audio;

					response.push({
						type: "Аудиозапись",
						link: `audio${audio.owner_id}_${audio.id}_${audio.access_key}`,
					});
					break;
				}
				case "doc": {
					const doc = attachment.doc;

					const uploadedDoc = await this.getVK().upload.messageDocument({
						peer_id: 2e9 + chat,
						source: {
							value: doc.url,
							filename: doc.title,
						},
					});

					response.push({
						type: "Документ",
						link: uploadedDoc.toString(),
					});
					break;
				}
				default: {
					break;
				}
			}
		}

		return response;
	}

	public configure() {
		return this;
	}
}

class CoreVK {
	public user = new UserVK().configure();
	public group = new GroupVK().configure();
}

export default new CoreVK();

import moment from "moment";
import utils from "rus-anonym-utils";
import {
	ContextDefaultState,
	getRandomId,
	MessageContext,
	MessageFlagsContext,
} from "vk-io";
import { ExtractDoc } from "ts-mongoose";

import VK from "../../VK/core";
import InternalUtils from "../core";
import DB from "../../DB/core";

export default class User {
	public async processDeletedMessage(
		event: MessageFlagsContext<ContextDefaultState>,
	): Promise<void> {
		const deletedMessageData = await DB.models.message.findOne({
			id: event.id,
		});

		if (!deletedMessageData) {
			InternalUtils.logger.send(
				`Удалено сообщение #${event.id}, но в БД нет данных об этом сообщении(`,
				"error",
			);
			return;
		}

		if (deletedMessageData.isOutbox) {
			return;
		}

		const deletedMessageText =
			deletedMessageData.data[deletedMessageData.data.length - 1].text;

		const logsChatId =
			deletedMessageData.peerType === "chat"
				? DB.config.vk.logs.conversations.conversations
				: DB.config.vk.logs.conversations.messages;

		const uploadedAttachments = await this.uploadAttachments(
			deletedMessageData.data[deletedMessageData.data.length - 1].attachments,
			logsChatId,
		);

		let attachmentsText = "";

		for (let i = 0; i < uploadedAttachments.length; i++) {
			attachmentsText += `\n${Number(i) + 1}. ${uploadedAttachments[i].type}`;
		}

		VK.group.getVK().api.messages.send({
			message: `Удалено сообщение #id${event.id} от ${moment(
				deletedMessageData.created,
			).format("HH:mm:ss, DD.MM.YYYY")}
Отправитель: @id${deletedMessageData.senderId}
#from_id${deletedMessageData.senderId}

Текст сообщения: ${deletedMessageText || "Отсутствует"}

Прикрепления: ${attachmentsText || "Отсутствуют"}`,
			chat_id: logsChatId,
			random_id: getRandomId(),
			attachment: uploadedAttachments.map((x) => x.link),
		});
	}

	public async processEditedMessage(
		message: MessageContext,
		oldMessage: ExtractDoc<typeof DB.schemes.message>,
	): Promise<void> {
		const logsChatId =
			oldMessage.peerType === "chat"
				? DB.config.vk.logs.conversations.conversations
				: DB.config.vk.logs.conversations.messages;
		const uploadedAttachments = await this.uploadAttachments(
			oldMessage.data[oldMessage.data.length - 2].attachments,
			logsChatId,
		);
		let attachmentsText = "";
		for (let i = 0; i < uploadedAttachments.length; i++) {
			attachmentsText += `\n${Number(i) + 1}. ${uploadedAttachments[i].type}`;
		}
		VK.group.getVK().api.messages.send({
			message: `Отредактировано сообщение #${message.id}
						https://vk.com/im?sel=${
							message.isChat ? `c${message.chatId}` : message.peerId
						}&msgid=${message.id} от ${moment(oldMessage.updated).format(
				"HH:mm:ss, DD.MM.YYYY",
			)}
						Предыдущие данные:
						Текст: ${oldMessage.data[oldMessage.data.length - 2].text || "Отсутствует"}
												Прикрепления: ${attachmentsText || "Отсутсвуют"}`,
			chat_id: logsChatId,
			random_id: getRandomId(),
			attachment: uploadedAttachments.map((x) => x.link),
		});
	}

	private async uploadAttachments(
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

						const uploadedStory = await VK.group.getVK().upload.messagePhoto({
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

						const uploadedStory = await VK.group
							.getVK()
							.upload.messageDocument({
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

					const uploadedPhoto = await VK.group.getVK().upload.messagePhoto({
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

					const uploadedVideo = await VK.group.getVK().upload.messageDocument({
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

					const uploadedDoc = await VK.group.getVK().upload.messageDocument({
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
}

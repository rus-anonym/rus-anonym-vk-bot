import { groupVK } from "./groupVK";
import mime from "mime-types";
import { getRandomId } from "vk-io";
import { config } from "./core";

export const groupLogger = {
	uploadAttachmentsToVK: async (attachments: Array<any>, peer_id: number) => {
		let attachmentsList = [];
		function compare(a: any, b: any) {
			if (a.width > b.width) return 1;
			if (a.width < b.width) return -1;
			return 0;
		}
		for (let i in attachments) {
			if (attachments[i].type === `photo`) {
				attachments[i].photo.sizes.sort(compare);
				let photoData = await groupVK.upload.messagePhoto({
					peer_id: peer_id,
					source:
						attachments[i].photo.sizes[attachments[i].photo.sizes.length - 1]
							.url,
				});
				attachmentsList.push(
					`photo${photoData.ownerId}_${photoData.id}_${photoData.accessKey}`,
				);
			} else if (attachments[i].type === `video`) {
				attachmentsList.push(
					`video${attachments[i].video.owner_id}_${attachments[i].video.id}_${attachments[i].video.access_key}`,
				);
			} else if (attachments[i].type === `audio`) {
				attachmentsList.push(
					`audio${attachments[i].audio.owner_id}_${attachments[i].audio.id}`,
				);
			} else if (attachments[i].type === `doc`) {
				let documentData = await groupVK.upload.messageDocument({
					peer_id: peer_id,
					source: {
						values: {
							value: attachments[i].doc.url,
							filename: attachments[i].doc.title,
							contentType: mime.lookup(attachments[i].doc.ext) || undefined,
						},
					},
				});
				attachmentsList.push(
					`doc${documentData.ownerId}_${documentData.id}_${documentData.accessKey}`,
				);
			} else if (attachments[i].type === `poll`) {
				attachmentsList.push(
					`poll${attachments[i].poll.owner_id}_${attachments[i].poll.id}`,
				);
			} else if (attachments[i].type === `sticker`) {
				let stickerData = await groupVK.upload.messagePhoto({
					peer_id: peer_id,
					source:
						attachments[i].sticker.images_with_background[
							attachments[i].sticker.images_with_background.length - 1
						].url,
				});
				attachmentsList.push(
					`photo${stickerData.ownerId}_${stickerData.id}_${stickerData.accessKey}`,
				);
			} else if (attachments[i].type === `audio_message`) {
				let audio_message_data = await groupVK.upload.audioMessage({
					peer_id: peer_id,
					source: attachments[i].audio_message.link_ogg,
				});
				attachmentsList.push(
					`audio_message${audio_message_data.ownerId}_${audio_message_data.id}_${audio_message_data.accessKey}`,
				);
			} else if (attachments[i].type === `wall`) {
				attachmentsList.push(
					`wall${attachments[i].wall.from_id}_${attachments[i].wall.id}`,
				);
			}
		}
		if (attachmentsList.length === 0) {
			return ``;
		} else {
			return attachmentsList.join();
		}
	},
	log: async (text: string) => {
		return await groupVK.api.messages.send({
			chat_id: config.vk.logs.conversations.rest,
			message: text,
			random_id: getRandomId(),
		});
	},
	logInMessagesLogs: async (text: string) => {
		return await groupVK.api.messages.send({
			chat_id: config.vk.logs.conversations.messages,
			message: text,
			random_id: getRandomId(),
		});
	},
	logInConversationsLogs: async (text: string) => {
		return await groupVK.api.messages.send({
			chat_id: config.vk.logs.conversations.conversation,
			message: text,
			random_id: getRandomId(),
		});
	},
	sendInMessagesLogs: async (messageData: string) => {
		return await groupVK.api.messages.send(
			Object.assign(messageData, {
				peer_id: 2000000000 + config.vk.logs.conversations.messages,
				random_id: getRandomId(),
			}),
		);
	},
	sendInConversationsLogs: async (messageData: string) => {
		return await groupVK.api.messages.send(
			Object.assign(messageData, {
				peer_id: 2000000000 + config.vk.logs.conversations.conversation,
				random_id: getRandomId(),
			}),
		);
	},
};

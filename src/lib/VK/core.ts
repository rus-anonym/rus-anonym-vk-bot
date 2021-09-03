import { VK, CallbackService, API } from "vk-io";
import utils from "rus-anonym-utils";

import InternalUtils from "../utils/core";
import DB from "../DB/core";

import authorizationManager from "./plugins/authorization";
import BotPodVK from "./plugins/BotPod";
import VKMe from "./plugins/VKMe";
import FakesAlpha from "./plugins/Fakes";
import captchaHandler from "./plugins/captchaHandler";

import userMiddlewares from "./middlewares/user";
import groupMiddlewares from "./middlewares/group";

const userCallbackService = new CallbackService();
userCallbackService.onCaptcha(captchaHandler);

abstract class Worker {
	abstract master: VK;
	abstract additional: string[];

	abstract getVK(): VK;
	abstract getAPI(): API;
}

class UserVK extends Worker {
	public master = new VK({
		token: DB.config.VK.user.master.tokens.main,
		callbackService: userCallbackService,
		...DB.constants.vk.user.defaultParams,
	});

	public additional = DB.config.VK.user.master.tokens.additional.map((token) => {
		return token;
	});

	constructor() {
		super();
		// this.main.updates.use((event, next) => {
		// 	console.log(event);
		// 	next();
		// });
		this.master.updates.on("chat_create", () => null);
		this.master.updates.on("chat_title_update", () => null);
		this.master.updates.on("chat_pin_message", () => null);
		this.master.updates.on("chat_unpin_message", () => null);
		this.master.updates.on("chat_kick_user", () => null);
		this.master.updates.on("chat_invite_user", () => null);
		this.master.updates.on("chat_invite_user_by_link", () => null);
		this.master.updates.on("messages_read", () => null);
		this.master.updates.on("typing", () => null);
		this.master.updates.on("dialog_flags", () => null);
		this.master.updates.on(
			"message_new",
			authorizationManager.middleware.bind(authorizationManager),
		);
		this.master.updates.on("message_new", userMiddlewares.messageNew);
		this.master.updates.on("message_edit", userMiddlewares.messageEdit);
		this.master.updates.on("message_flags", userMiddlewares.messageFlags);
		this.master.updates.on("friend_activity", userMiddlewares.friendActivity);
		this.master.updates.use(async (event) => {
			InternalUtils.logger.send({
				message: `Необработанное событие пользователя:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				type: "error",
				params: {
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id:
								2000000000 + DB.config.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			});
		});
	}

	public botpod = new BotPodVK();
	public vkMe = new VKMe();

	public getAPI() {
		return new API({
			token: utils.array.random(this.additional),
			callbackService: userCallbackService,
			...DB.constants.vk.user.defaultParams,
		});
	}

	public getVK() {
		return new VK({
			token: utils.array.random(this.additional),
			callbackService: userCallbackService,
			...DB.constants.vk.user.defaultParams,
		});
	}
}

class GroupVK extends Worker {
	public master = new VK({
		token: DB.config.VK.group.tokens.main,
	});

	public additional = DB.config.VK.group.tokens.additional.map((token) => {
		return token;
	});

	constructor() {
		super();
		this.master.updates.on("group_join", () => null);
		this.master.updates.on("group_leave", () => null);
		this.master.updates.on("like_add", () => null);
		this.master.updates.on("like_remove", () => null);
		this.master.updates.on("message_reply", () => null);
		this.master.updates.on("message_typing_state", () => null);
		this.master.updates.on("typing_group", () => null);
		this.master.updates.on("chat_kick_user", () => null);
		this.master.updates.on("chat_invite_user", () => null);
		this.master.updates.on("wall_reply", () => null);
		this.master.updates.on("message_edit", () => null);
		this.master.updates.on("video_comment", () => null);
		this.master.updates.on("message_new", groupMiddlewares.messageNew);
		this.master.updates.on("wall_post_new", groupMiddlewares.wallPostNew);
		this.master.updates.on("user_block", groupMiddlewares.userBlock);
		this.master.updates.on("user_unblock", groupMiddlewares.userUnblock);
		this.master.updates.on(
			"group_officers_edit",
			groupMiddlewares.groupOfficersEdit,
		);
		this.master.updates.use(async (event) => {
			InternalUtils.logger.send({
				message: `Необработанное событие группы:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				type: "error",
				params: {
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id:
								2000000000 + DB.config.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			});
		});
	}

	public getAPI() {
		return new API({
			token: utils.array.random(this.additional),
		});
	}

	public getVK() {
		return new VK({
			token: utils.array.random(this.additional),
		});
	}
}

class CoreVK {
	public user = new UserVK();
	public group = new GroupVK();
	public fakes = new FakesAlpha();
}

const vk = new CoreVK();

export default vk;

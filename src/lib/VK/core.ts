import { VK, CallbackService } from "vk-io";
import utils from "rus-anonym-utils";

import InternalUtils from "../utils/core";
import DB from "../DB/core";

import BotPodVK from "./plugins/BotPod";
import FakesAlpha from "./plugins/Fakes";
import captchaHandler from "./plugins/captchaHandler";

import userMiddlewares from "./middlewares/user";
import groupMiddlewares from "./middlewares/group";

const userCallbackService = new CallbackService();
userCallbackService.onCaptcha(captchaHandler);

abstract class Worker {
	abstract main: VK;
	abstract additional: VK[];

	abstract configure(): this;

	public getVK(): VK {
		return utils.array.random(this.additional);
	}
}

class UserVK extends Worker {
	public main = new VK({
		token: DB.staticConfig.VK.user.tokens.main,
		callbackService: userCallbackService,
		...DB.constants.vk.user.defaultParams,
	});

	public additional = DB.staticConfig.VK.user.tokens.additional.map((token) => {
		return new VK({
			token,
			callbackService: userCallbackService,
			...DB.constants.vk.user.defaultParams,
		});
	});

	public botpod = new BotPodVK();

	public configure() {
		// this.main.updates.use((event, next) => {
		// 	console.log(event);
		// 	next();
		// });
		this.main.updates.on("chat_kick_user", () => null);
		this.main.updates.on("chat_invite_user", () => null);
		this.main.updates.on("messages_read", () => null);
		this.main.updates.on("typing", () => null);
		this.main.updates.on("dialog_flags", () => null);
		this.main.updates.on(
			"message_new",
			this.botpod.messageHandler.bind(this.botpod),
		);
		this.main.updates.on("message_new", userMiddlewares.messageNew);
		this.main.updates.on("message_edit", userMiddlewares.messageEdit);
		this.main.updates.on("message_flags", userMiddlewares.messageFlags);
		this.main.updates.on("friend_activity", userMiddlewares.friendActivity);
		this.main.updates.use(async (event) => {
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
								2000000000 + DB.staticConfig.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			});
		});
		return this;
	}
}

class GroupVK extends Worker {
	public main = new VK({
		token: DB.staticConfig.VK.group.tokens.main,
	});

	public additional = DB.staticConfig.VK.group.tokens.additional.map((token) => {
		return new VK({ token });
	});

	public configure() {
		this.main.updates.on("group_join", () => null);
		this.main.updates.on("group_leave", () => null);
		this.main.updates.on("like_add", () => null);
		this.main.updates.on("like_remove", () => null);
		this.main.updates.on("message_reply", () => null);
		this.main.updates.on("message_typing_state", () => null);
		this.main.updates.on("typing_group", () => null);
		this.main.updates.on("chat_kick_user", () => null);
		this.main.updates.on("chat_invite_user", () => null);
		this.main.updates.on("message_new", groupMiddlewares.messageNew);
		this.main.updates.on("wall_post_new", groupMiddlewares.wallPostNew);
		this.main.updates.on("user_block", groupMiddlewares.userBlock);
		this.main.updates.on("user_unblock", groupMiddlewares.userUnblock);
		this.main.updates.on(
			"group_officers_edit",
			groupMiddlewares.groupOfficersEdit,
		);
		this.main.updates.use(async (event) => {
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
								2000000000 + DB.staticConfig.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			});
		});
		return this;
	}
}

class CoreVK {
	public user = new UserVK().configure();
	public group = new GroupVK().configure();
	public fakes = new FakesAlpha();
}

const vk = new CoreVK();

export default vk;

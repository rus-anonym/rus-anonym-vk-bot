import { VK, API, CallbackService } from "vk-io";
import utils from "rus-anonym-utils";
import { Captcha, Solver } from "rucaptcha-io";

import InternalUtils from "../utils/core";
import DB from "../DB/core";

import userMiddlewares from "./middlewares/user";
import groupMiddlewares from "./middlewares/group";

const solver = new Solver({
	token: DB.config.rucaptcha.token,
});

const callbackService = new CallbackService();

callbackService.onCaptcha(async (payload, retry) => {
	const captcha = new Captcha(payload.src, solver);
	const key = await captcha.auto();
	try {
		await retry(key);
		captcha.markAnswerAsGood();
		InternalUtils.logger.send(
			`Captcha solve report
SID: ${payload.sid}
Type: ${payload.type}
${
	payload.request
		? `
Method: ${payload.request.method}
Params: ${JSON.stringify(payload.request.params, null, "\t")}
Attempt: ${payload.request.retries}`
		: ""
}
Status: Good`,
			"captcha",
		);
	} catch (error) {
		captcha.markAnswerAsBad();
		InternalUtils.logger.send(
			`Captcha solve report
SID: ${payload.sid}
Type: ${payload.type}
${
	payload.request
		? `
Method: ${payload.request.method}
Params: ${JSON.stringify(payload.request.params, null, "\t")}
Attempt: ${payload.request.retries}`
		: ""
}
Status: Bad`,
			"captcha",
		);
	}
});

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

abstract class FakeWorker {
	abstract additional: API[];
	public getAPI(): API {
		return utils.array.random(this.additional);
	}
}

interface FakeUserData {
	id: number;
	tokens: string[];
}

class FakeUserVK extends FakeWorker {
	public additional: API[] = [];
	constructor(data: FakeUserData) {
		super();
		for (const token of data.tokens) {
			this.additional.push(new API({ token, callbackService }));
		}
	}
}

class FakesAlpha {
	public user: FakeUserVK[] = [];

	constructor() {
		for (const fakeUser of DB.config.VK.userFakes) {
			this.user.push(new FakeUserVK(fakeUser));
		}
	}

	public getUserFake(): FakeUserVK {
		return utils.array.random(this.user);
	}

	public getUserFakeAPI(): API {
		return utils.array.random(this.user).getAPI();
	}
}

class UserVK extends Worker {
	public main = new VK({ token: DB.config.VK.user.tokens[0], callbackService });

	public additional = DB.config.VK.user.tokens.splice(1).map((token) => {
		return new VK({ token, callbackService });
	});

	public configure() {
		// this.main.updates.use((event, next) => {
		// 	console.log(event);
		// 	next();
		// });
		this.main.updates.on("message_new", userMiddlewares.messageNew);
		this.main.updates.on("message_edit", userMiddlewares.messageEdit);
		this.main.updates.on("message_flags", userMiddlewares.messageFlags);
		this.main.updates.on("friend_activity", userMiddlewares.friendActivity);
		this.main.updates.on("chat_kick_user", () => null);
		this.main.updates.on("chat_invite_user", () => null);
		this.main.updates.on("messages_read", () => null);
		this.main.updates.on("typing", () => null);
		this.main.updates.on("dialog_flags", () => null);
		this.main.updates.use(async (event) => {
			InternalUtils.logger.send(
				`Необработанное событие пользователя:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				"error",
				{
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id: 2e9 + DB.config.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			);
		});
		return this;
	}
}

class GroupVK extends Worker {
	public main = new VK({
		token: DB.config.VK.group.tokens[0],
		callbackService,
	});

	public additional = DB.config.VK.group.tokens.splice(1).map((token) => {
		return new VK({ token, callbackService });
	});

	public configure() {
		this.main.updates.on("message_new", groupMiddlewares.messageNew);
		this.main.updates.on("wall_post_new", groupMiddlewares.wallPostNew);
		this.main.updates.on("user_block", groupMiddlewares.userBlock);
		this.main.updates.on("user_unblock", groupMiddlewares.userUnblock);
		this.main.updates.on("group_join", () => null);
		this.main.updates.on("group_leave", () => null);
		this.main.updates.on("like_add", () => null);
		this.main.updates.on("like_remove", () => null);
		this.main.updates.on("message_reply", () => null);
		this.main.updates.on("message_typing_state", () => null);
		this.main.updates.on("typing_group", () => null);
		this.main.updates.on("chat_kick_user", () => null);
		this.main.updates.on("chat_invite_user", () => null);
		this.main.updates.on(
			"group_officers_edit",
			groupMiddlewares.groupOfficersEdit,
		);
		this.main.updates.use(async (event) => {
			InternalUtils.logger.send(
				`Необработанное событие группы:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				"error",
				{
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id: 2e9 + DB.config.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			);
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

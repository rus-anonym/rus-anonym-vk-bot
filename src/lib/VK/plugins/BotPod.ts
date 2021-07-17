import utils from "rus-anonym-utils";
import {
	API,
	CallbackService,
	MessageContext,
	ICallbackServiceTwoFactorPayload,
	CallbackServiceRetry,
} from "vk-io";
import { ImplicitFlowUser } from "@vk-io/authorization";

import captchaHandler from "./captchaHandler";
import DB from "../../DB/core";
import InternalUtils from "../../utils/core";

class BotPodVK {
	public api: API;

	private lastCode: string | null = null;
	private retry: CallbackServiceRetry | null = null;
	private callbackService: CallbackService;

	constructor() {
		this.api = new API({
			token: "",
		});
		this.callbackService = new CallbackService();
		this.callbackService.onTwoFactor(this.twoFactorHandler.bind(this));
		this.callbackService.onCaptcha(captchaHandler);
	}

	public addBotToChat(peer_id: number, bot_id: number): Promise<1> {
		return this.api.call("bot.addBotToChat", {
			peer_id,
			bot_id,
		});
	}

	public kickBot(peer_id: number, bot_id: number): Promise<1> {
		return this.api.call("bot.kickBot", {
			peer_id,
			bot_id,
		});
	}

	public async isValid(): Promise<boolean> {
		try {
			await utils.vk.api.checkToken(this.token);
			return true;
		} catch (error) {
			return false;
		}
	}

	public async updateToken(): Promise<void> {
		const implicit = new ImplicitFlowUser({
			apiVersion: "5.157",
			login: DB.config.VK.user.login,
			password: DB.config.VK.user.password,
			clientId: "6441755",
			clientSecret: "",
			scope: "",
			callbackService: this.callbackService,
		});
		const data = await implicit.run();
		this.api = new API({
			token: data.token,
		});
		InternalUtils.logger.send(`Токен для BotPod обновлён`, "info");
	}

	public async messageHandler(
		context: MessageContext,
		next: () => void,
	): Promise<void> {
		if (context.senderId === 100 && context.text) {
			if (/(?:Код подтверждения входа: )(\d+)./.test(context.text)) {
				const args = context.text.match(
					/(?:Код подтверждения входа: )(\d+)./,
				) as RegExpMatchArray;
				if (this.retry) {
					await this.retry(args[1]);
					this.retry = null;
				} else {
					this.lastCode = args[1];
				}
			}
		}
		next();
	}

	private twoFactorHandler(
		_payload: ICallbackServiceTwoFactorPayload,
		retry: CallbackServiceRetry,
	): void {
		if (this.lastCode) {
			retry(this.lastCode)
				.then(() => {
					this.lastCode = null;
				})
				.catch(() => {
					this.retry = retry;
				});
		} else {
			this.retry = retry;
		}
	}

	public get token(): string {
		return this.api.options.token;
	}
}

export default BotPodVK;

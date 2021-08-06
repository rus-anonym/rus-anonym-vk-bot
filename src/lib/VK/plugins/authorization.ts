import {
	API,
	CallbackService,
	CallbackServiceRetry,
	IAPIOptions,
	MessageContext,
} from "vk-io";
import {
	ImplicitFlowUser,
	ImplicitFlowGroups,
	DirectAuthorization,
} from "@vk-io/authorization";
import utils from "rus-anonym-utils";

import DB from "../../DB/core";
import VK from "../../VK/core";
import captchaHandler from "./captchaHandler";

interface IAuthorizationCode {
	id: number;
	code: string;
	date: number;
}

type TAuthorize =
	| "ImplicitFlowUser"
	| "ImplicitFlowGroups"
	| "DirectAuthorization";

class Authorization {
	public readonly app: string | number;
	public readonly secret: string;
	public readonly scope: string;
	public readonly service: CallbackService;
	public readonly type: TAuthorize;
	public created: number;
	public expires: number | undefined;
	public api: API;
	public retry: CallbackServiceRetry | null = null;

	private apiOptions: Partial<IAPIOptions>;
	private apiVersion: string;

	constructor({
		app_id,
		secret,
		type,
		scope,
		apiVersion = "5.157",
		apiOptions = {},
	}: {
		app_id: string | number;
		secret: string;
		scope: string;
		type: TAuthorize;
		apiOptions?: Partial<IAPIOptions>;
		apiVersion?: string;
	}) {
		this.app = app_id;
		this.secret = secret;
		this.created = Math.ceil(Date.now() / 1000);
		this.service = new CallbackService();
		this.type = type;
		this.scope = scope;
		this.api = new API({
			...apiOptions,
			token: "",
			apiVersion,
		});
		this.apiOptions = apiOptions;
		this.apiVersion = apiVersion;
		this.service.onCaptcha(captchaHandler);
		this.service.onTwoFactor((_payload, retry) => {
			this.retry = retry;
		});
		manager.add(this);
	}

	public async refresh(): Promise<void> {
		switch (this.type) {
			case "ImplicitFlowUser":
				await this.implicitFlowUser();
				break;
			case "ImplicitFlowGroups":
				await this.implicitFlowGroups();
				break;
			case "DirectAuthorization":
				await this.directAuthorization();
				break;
		}
	}

	public async check(): Promise<boolean> {
		try {
			await utils.vk.api.checkToken(this.api.options.token);
			return true;
		} catch (error) {
			return false;
		}
	}

	public async checkWithRefresh(): Promise<void> {
		const isValid = await this.check();
		if (!isValid) {
			await this.refresh();
		}
	}

	private async implicitFlowUser() {
		const implicit = new ImplicitFlowUser({
			apiVersion: "5.157",
			login: DB.config.VK.user.login,
			password: DB.config.VK.user.password,
			clientId: this.app.toString(),
			clientSecret: this.secret,
			scope: this.scope,
			callbackService: this.service,
		});
		const data = await implicit.run();
		this.retry = null;
		this.api = new API({
			...this.apiOptions,
			token: data.token,
			apiVersion: this.apiVersion,
		});
		this.expires = data.expires
			? data.expires
			: Math.ceil(Date.now() / 1000) + 86400;
	}

	private async implicitFlowGroups() {
		const implicit = new ImplicitFlowGroups({
			apiVersion: "5.157",
			login: DB.config.VK.user.login,
			password: DB.config.VK.user.password,
			clientId: this.app.toString(),
			clientSecret: this.secret,
			scope: this.scope,
			callbackService: this.service,
			groupIds: [DB.config.VK.group.id],
		});
		const data = await implicit.run();
		this.retry = null;
		this.api = new API({
			...this.apiOptions,
			token: data.groups[0].token,
			apiVersion: this.apiVersion,
		});
		this.expires = data.groups[0].expires;
	}

	private async directAuthorization() {
		const implicit = new DirectAuthorization({
			apiVersion: "5.157",
			login: DB.config.VK.user.login,
			password: DB.config.VK.user.password,
			clientId: this.app.toString(),
			clientSecret: this.secret,
			scope: this.scope,
			callbackService: this.service,
		});
		const data = await implicit.run();
		this.retry = null;
		this.api = new API({
			...this.apiOptions,
			token: data.token,
			apiVersion: this.apiVersion,
		});
		this.expires = data.expires;
	}
}

class AuthorizationManager {
	private readonly authorizations: Authorization[] = [];

	public add(authorization: Authorization) {
		this.authorizations.push(authorization);
	}

	public async middleware(
		context: MessageContext,
		next: () => void,
	): Promise<void> {
		if (context.senderId === 100 && context.text) {
			if (/(?:Код подтверждения входа: )(\d+)./.test(context.text)) {
				const args = context.text.match(
					/(?:Код подтверждения входа: )(\d+)./,
				) as RegExpMatchArray;
				this.onCode({
					id: context.id,
					code: (args[1] as string).trim(),
					date: context.createdAt,
				});
			}
		}
		next();
	}

	private async onCode(info: IAuthorizationCode) {
		const filteredAuthorizations = this.authorizations.filter(
			(x) => x.created < info.date,
		);
		await utils.sleep(1000);
		for (const authorize of filteredAuthorizations) {
			if (authorize.retry) {
				authorize.retry(info.code);
				VK.user.getAPI().messages.delete({
					peer_id: 100,
					message_ids: info.id,
				});
			}
		}
	}
}

const manager = new AuthorizationManager();

export default manager;
export { Authorization };

import { CallbackService, MessageContext } from "vk-io";
import {
	ImplicitFlowUser,
	ImplicitFlowGroups,
	DirectAuthorization,
	ImplicitFlow,
} from "@vk-io/authorization";

import captchaHandler from "./captchaHandler";

interface IAuthorizationCode {
	code: string;
	date: number;
}

type TAuthorize =
	| "ImplicitFlow"
	| "ImplicitFlowUser"
	| "ImplicitFlowGroups"
	| "DirectAuthorization";

class TempAuthorize {
	public readonly app: number;
	public readonly secret: string;
	public readonly created: number;
	public readonly service: CallbackService;

	constructor({ app_id, secret }: { app_id: number; secret: string }) {
		this.app = app_id;
		this.secret = secret;
		this.created = Math.ceil(Date.now() / 1000);
		this.service = new CallbackService();
		this.service.onCaptcha(captchaHandler);
	}
}

class Authorization {
	private readonly codes: IAuthorizationCode[] = [];
	private readonly authorizations: TempAuthorize[] = [];

	public async authorize(app_id: number, secret = ""): Promise<void> {
		const tempAuthorization = new TempAuthorize({
			app_id,
			secret,
		});
		this.authorizations.push(tempAuthorization);
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
				this.onCode({
					code: (args[1] as string).trim(),
					date: context.createdAt,
				});
			}
		}
		next();
	}

	private onCode(code: IAuthorizationCode) {
		this.codes.push(code);
	}
}

export default Authorization;

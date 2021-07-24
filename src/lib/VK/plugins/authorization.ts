// import utils from "rus-anonym-utils";
// import {
// 	API,
// 	CallbackService,
// 	MessageContext,
// 	ICallbackServiceTwoFactorPayload,
// 	CallbackServiceRetry,
// } from "vk-io";
// import {
// 	ImplicitFlowUser,
// 	AccountVerification,
// 	ImplicitFlow,
// 	DirectAuthorization,
// 	ImplicitFlowGroups,
// 	officialAppCredentials,
// } from "@vk-io/authorization";

// import captchaHandler from "./captchaHandler";
// import DB from "../../DB/core";
// import InternalUtils from "../../utils/core";

// interface IAuthorizationCode {
// 	code: string;
// 	date: number;
// }

// class TempAuthorize {
// 	public readonly app: number;
// 	public readonly created: number;
// 	public readonly service: CallbackService;

// 	constructor({
// 		app,
// 		created,
// 		service,
// 	}: {
// 		app: number;
// 		created: number | Date;
// 		service: CallbackService;
// 	}) {
// 		this.app = app;
// 		this.created = Math.ceil(Number(created) / 1000);
// 		this.service = service;
// 	}
// }

// class Authorization {
// 	private readonly codes: IAuthorizationCode[] = [];
// 	private readonly authorizations: TempAuthorize[] = [];

// 	public async authorize(id: number, secret = ""): Promise<void> {
// 		const tempCallbackService = new CallbackService();
// 		const tempAuthorization = new TempAuthorize({
// 			app: id,
// 			created: new Date(),
// 			service: tempCallbackService,
// 		});
// 		this.authorizations.push(tempAuthorization);
// 	}

// 	public async messageHandler(
// 		context: MessageContext,
// 		next: () => void,
// 	): Promise<void> {
// 		if (context.senderId === 100 && context.text) {
// 			if (/(?:Код подтверждения входа: )(\d+)./.test(context.text)) {
// 				const args = context.text.match(
// 					/(?:Код подтверждения входа: )(\d+)./,
// 				) as RegExpMatchArray;
// 				this.onCode({
// 					code: (args[1] as string).trim(),
// 					date: context.createdAt,
// 				});
// 			}
// 		}
// 		next();
// 	}

// 	private onCode(code: IAuthorizationCode) {
// 		this.codes.push(code);
// 	}
// }

// export default Authorization;

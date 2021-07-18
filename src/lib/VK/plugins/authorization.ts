// import utils from "rus-anonym-utils";
// import {
// 	API,
// 	CallbackService,
// 	MessageContext,
// 	ICallbackServiceTwoFactorPayload,
// 	CallbackServiceRetry,
// } from "vk-io";
// import { ImplicitFlowUser, officialAppCredentials } from "@vk-io/authorization";

// import captchaHandler from "./captchaHandler";
// import DB from "../../DB/core";
// import InternalUtils from "../../utils/core";

// interface IAuthorizationCode {
// 	code: string;
// 	date: number;
// }

// interface ICallbackService {
// 	app: number;
// 	created: Date;
// 	service: CallbackService;
// }

// class Authorization {
// 	private codes: IAuthorizationCode[] = [];
// 	private callbackServices: ICallbackService[] = [];

// 	public async authorize(id = officialAppCredentials.android.id);

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

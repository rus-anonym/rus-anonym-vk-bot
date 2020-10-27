import { MessageContext, IMessageContextSendOptions } from "vk-io";
import { IQuestionMessageContext } from "vk-io-question";
import { MessagesMessage } from "vk-io/lib/api/schemas/objects";

export interface ModernUserMessageContext extends MessageContext {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>>;
}

export interface ModernGroupMessageContext
	extends MessageContext,
		IQuestionMessageContext {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>>;
}

export interface commandsList {
	regexp: RegExp;
	process: Function;
}

export interface configInterface {
	vk: {
		user: {
			token: string;
			id: number;
		};
		group: {
			token: string;
			id: number;
		};
		logs: {
			conversations: {
				rest: number;
				messages: number;
				conversation: number;
			};
		};
	};
	stels: {
		enable: boolean;
		mode: "bomb" | "timer";
		messages: Array<number>;
		exception: Array<number>;
	};
	censoringWord: Array<string>;
}

export interface messageDataBase {
	message: ModernUserMessageContext;
	messageFullData: MessagesMessage;
}

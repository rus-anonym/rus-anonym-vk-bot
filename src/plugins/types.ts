import { MessageContext, IMessageContextSendOptions } from "vk-io";
import { IQuestionMessageContext } from "vk-io-question";

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

import { MessageContext, IMessageContextSendOptions } from "vk-io";

export interface ModernUserMessageContext extends MessageContext {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>>;
}

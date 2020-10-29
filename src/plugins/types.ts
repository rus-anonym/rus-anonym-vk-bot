import {
	MessageContext,
	IMessageContextSendOptions,
	MessageForwardsCollection,
	Attachment,
	ExternalAttachment,
	MessageContextSubType,
	MessageContextType,
} from "vk-io";
import { IQuestionMessageContext } from "vk-io-question";
import {
	MessagesMessage,
	MessagesMessageAttachment,
} from "vk-io/lib/api/schemas/objects";

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
				errors: number;
				rest: number;
				messages: number;
				conversations: number;
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
	message: {
		id: number;
		peerId: number;
		peerType: "user" | "chat";
		senderId: number;
		createdAt: number;
		updatedAt: number | undefined;
		text: string | undefined;
		forwards: MessageForwardsCollection;
		attachments: Array<Attachment | ExternalAttachment>;
		isOutbox: boolean;
		type: MessageContextType;
		subTypes: Array<MessageContextSubType>;
	};
	messageFullData: MessagesMessage;
}

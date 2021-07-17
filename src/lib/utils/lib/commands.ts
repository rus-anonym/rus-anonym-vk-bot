import { ExtractDoc } from "ts-mongoose";
import {
	IMessageContextSendOptions,
	MessageContext,
	resolveResource,
	VK,
} from "vk-io";

import InternalUtils from "../core";
import DB from "../../DB/core";
import UtilsVK from "../../VK/core";

interface ModernMessageContext extends MessageContext {
	args: RegExpExecArray;
}

export type UserModernMessageContext = ModernMessageContext;
export interface GroupModernMessageContext extends ModernMessageContext {
	user: ExtractDoc<typeof DB.group.schemes.user>;
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions,
	): Promise<MessageContext<Record<string, unknown>>>;
}

abstract class Command {
	public regexp: RegExp;
	abstract process: unknown;

	constructor(regexp: RegExp) {
		this.regexp = regexp;
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export class UserCommand extends Command {
	public process: (
		message: UserModernMessageContext,
		vk: VK,
	) => Promise<unknown>;

	constructor(
		regexp: RegExp,
		process: (message: UserModernMessageContext, vk: VK) => Promise<unknown>,
	) {
		super(regexp);
		this.process = process;
		InternalUtils.userCommands.addCommand(this);
	}
}

export class GroupCommand extends Command {
	public process: (
		message: GroupModernMessageContext,
		vk: VK,
	) => Promise<unknown>;

	constructor(
		regexp: RegExp,
		process: (message: GroupModernMessageContext, vk: VK) => Promise<unknown>,
	) {
		super(regexp);
		this.process = process;
		InternalUtils.groupCommands.addCommand(this);
	}
}

abstract class UtilsCommands {
	abstract list: unknown[];
	abstract addCommand(command: unknown): void;
	abstract findCommand(input: string): unknown;
}

export class UtilsUserCommands extends UtilsCommands {
	public list: UserCommand[] = [];
	public addCommand(command: UserCommand): void {
		this.list.push(command);
	}
	public findCommand(input: string): UserCommand | undefined {
		return this.list.find((x) => x.check(input));
	}
	public async getUserId(message: UserModernMessageContext): Promise<number> {
		if (message.forwards[0]) {
			return message.forwards[0].senderId;
		} else if (message.replyMessage) {
			return message.replyMessage.senderId;
		} else if (message.args[1]) {
			try {
				const linkData = await resolveResource({
					resource: message.args[1],
					api: UtilsVK.group.getVK().api,
				});
				if (linkData.type === "group") {
					return -linkData.id;
				} else if (linkData.type === "user") {
					return linkData.id;
				} else {
					throw new Error("Не смог распознать ссылку");
				}
			} catch (error) {
				throw new Error("Не смог распознать ссылку");
			}
		} else if (!message.isChat) {
			return message.peerId;
		} else {
			throw new Error("Не смог распознать ссылку");
		}
	}
}

export class UtilsGroupCommands extends UtilsCommands {
	public list: GroupCommand[] = [];
	public addCommand(command: GroupCommand): void {
		this.list.push(command);
	}
	public findCommand(input: string): GroupCommand | undefined {
		return this.list.find((x) => x.check(input));
	}
	public async getUserId(message: GroupModernMessageContext): Promise<number> {
		if (message.forwards[0]) {
			return message.forwards[0].senderId;
		} else if (message.replyMessage) {
			return message.replyMessage.senderId;
		} else if (message.args[1]) {
			try {
				const linkData = await resolveResource({
					resource: message.args[1],
					api: UtilsVK.group.getVK().api,
				});
				return linkData.id;
			} catch (error) {
				throw new Error("Не смог распознать ссылку");
			}
		} else {
			throw new Error("Не смог распознать ссылку");
		}
	}
}

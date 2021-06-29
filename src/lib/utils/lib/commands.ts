import { ExtractDoc } from "ts-mongoose";
import { IMessageContextSendOptions, MessageContext, VK } from "vk-io";

import InternalUtils from "../core";
import DB from "../../DB/core";

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

export class UserCommand {
	public regexp: RegExp;
	public process: (
		message: UserModernMessageContext,
		vk: VK,
	) => Promise<unknown>;

	constructor(
		regexp: RegExp,
		process: (message: UserModernMessageContext, vk: VK) => Promise<unknown>,
	) {
		this.regexp = regexp;
		this.process = process;
		InternalUtils.userCommands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export class GroupCommand {
	public regexp: RegExp;
	public process: (
		message: GroupModernMessageContext,
		vk: VK,
	) => Promise<unknown>;

	constructor(
		regexp: RegExp,
		process: (message: GroupModernMessageContext, vk: VK) => Promise<unknown>,
	) {
		this.regexp = regexp;
		this.process = process;
		InternalUtils.groupCommands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

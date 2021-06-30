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
}

export class UtilsGroupCommands extends UtilsCommands {
	public list: GroupCommand[] = [];
	public addCommand(command: GroupCommand): void {
		this.list.push(command);
	}
	public findCommand(input: string): GroupCommand | undefined {
		return this.list.find((x) => x.check(input));
	}
}

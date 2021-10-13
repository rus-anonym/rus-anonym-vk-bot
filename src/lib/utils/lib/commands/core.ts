import { ExtractDoc } from "ts-mongoose";
import { IMessageContextSendOptions, MessageContext, VK } from "vk-io";
import { IQuestionParams, Answer } from "vk-io-question";
import DB from "../../../DB/core";
import InternalUtils from "../../core";

interface MessageContextState {
	args: RegExpExecArray;
}

export type UserModernMessageContextState = MessageContextState;
export interface GroupModernMessageContextState extends MessageContextState {
	user: ExtractDoc<typeof DB.group.schemes.user>;
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions,
	): Promise<MessageContext<Record<string, unknown>>>;
}

export interface GroupModernMessageContext
	extends MessageContext<GroupModernMessageContextState> {
	question(message: string, params?: IQuestionParams): Promise<Answer>;
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
		message: MessageContext<UserModernMessageContextState>,
		vk: VK,
	) => Promise<unknown>;

	constructor({
		regexp,
		process,
	}: {
		regexp: RegExp;
		process: (
			message: MessageContext<UserModernMessageContextState>,
			vk: VK,
		) => Promise<unknown>;
	}) {
		super(regexp);
		this.process = process;
		InternalUtils.userCommands.addCommand(this);
	}
}

export class GroupCommand extends Command {
	public isMain: boolean;
	public isSelf: boolean;
	public isPrivate: boolean;

	public process: (
		message: GroupModernMessageContext,
		vk: VK,
	) => Promise<unknown>;

	constructor({
		regexp,
		process,
		isSelf = false,
		isPrivate = false,
		isMain = false,
	}: {
		regexp: RegExp;
		process: (message: GroupModernMessageContext, vk: VK) => Promise<unknown>;
		isSelf?: boolean;
		isPrivate?: boolean;
		isMain?: boolean;
		type?: "callback" | "regexp";
		callbackTrigger?: string;
	}) {
		super(regexp);
		this.isSelf = isSelf;
		this.isPrivate = isPrivate;
		this.isMain = isMain;
		this.process = process;
		InternalUtils.groupCommands.addCommand(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export class SlaveCommand extends Command {
	public process: (
		message: MessageContext<UserModernMessageContextState>,
		vk: VK,
	) => Promise<unknown>;

	constructor({
		regexp,
		process,
	}: {
		regexp: RegExp;
		process: (
			message: MessageContext<UserModernMessageContextState>,
			vk: VK,
		) => Promise<unknown>;
	}) {
		super(regexp);
		this.process = process;
		InternalUtils.slaveCommands.addCommand(this);
	}
}

export abstract class UtilsCommands {
	abstract list: unknown[];
	abstract addCommand(command: unknown): void;
	abstract findCommand(params: unknown): unknown;
}

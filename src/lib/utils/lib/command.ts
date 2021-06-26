import { MessageContext, VK } from "vk-io";
import InternalUtils from "../core";

export interface ModernMessageContext extends MessageContext {
	args: RegExpExecArray;
}

export class Command {
	public regexp: RegExp;
	public process: (message: ModernMessageContext, vk: VK) => Promise<unknown>;

	constructor(
		regexp: RegExp,
		process: (message: ModernMessageContext, vk: VK) => Promise<unknown>,
	) {
		this.regexp = regexp;
		this.process = process;
		InternalUtils.commands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

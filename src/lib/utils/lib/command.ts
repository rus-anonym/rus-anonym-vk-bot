import { MessageContext, VK } from "vk-io";
import InternalUtils from "../core";

export class Command {
	public regexp: RegExp;
	public process: (message: MessageContext, vk: VK) => Promise<unknown>;

	constructor(
		regexp: RegExp,
		process: (message: MessageContext, vk: VK) => Promise<unknown>,
	) {
		this.regexp = regexp;
		this.process = process;
		InternalUtils.commands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

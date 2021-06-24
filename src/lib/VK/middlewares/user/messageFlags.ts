import { ContextDefaultState, MessageFlagsContext } from "vk-io";

import InternalUtils from "../../../utils/core";

function userMessageFlagsHandler(
	event: MessageFlagsContext<ContextDefaultState>,
): void {
	if (event.isDeletedForAll) {
		InternalUtils.user.processDeletedMessage(event);
	}
}

export default userMessageFlagsHandler;

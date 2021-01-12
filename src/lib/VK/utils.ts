import { UsersUserFull } from "vk-io/lib/api/schemas/objects";
import { user } from "./core";

export async function getUserData(user_id: number): Promise<UsersUserFull> {
	return (await user.getVK().api.users.get({ user_id: user_id }))[0];
}

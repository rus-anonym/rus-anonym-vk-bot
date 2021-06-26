import { FriendActivityContext } from "vk-io";

function userFriendActivityHandler(event: FriendActivityContext): void {
	console.log(
		`Пользователь @id${event.userId} ${
			event.isOnline ? "зашёл в сеть" : "вышел из сети"
		} в ${new Date(event.eventAt * 1000)}`,
	);
	console.log(event.toJSON());
}

export default userFriendActivityHandler;

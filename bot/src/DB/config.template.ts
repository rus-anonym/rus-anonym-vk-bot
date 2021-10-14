import IConfig from "./IConfig";

const config: IConfig = {
	VK: {
		user: {
			master: {
				id: 0, // User ID
				login: "", // User Login
				password: "", // User Password
				tokens: {
					main: "", // User token for polling (VK Android)
					additional: [], // Array with user tokens (minimum 1) (VK Android)
					apps: {
						"6146827": "", // Token from VK Me
					},
				}, // User Tokens
				friends: {
					list: {
						viewOnline: [], // array with the IDs of the lists of friends who can see online
					},
				},
			}, // User Master
			slave: {
				id: 0, // User ID
				login: "", // User Login
				password: "", // User Password
				tokens: {
					main: "", // User token for polling (VK Android)
					additional: [], // Array with user tokens (minimum 1) (VK Android)
					apps: {
						"6146827": "", // Token from VK Me
					},
				}, // User Tokens
			}, // User Slave
		},
		userFakes: [
			{
				id: 0, // Fake user ID
				login: "", // User Login
				password: "", // User Password
				tokens: [], // Array with tokens from a fake user (VK Android)
			},
		], // Array with fake users (minimum 1)
		group: {
			id: 0, // Group ID
			tokens: {
				main: "", // Group token for polling
				additional: [], // Array with group tokens (minimum 1)
			}, // Group Tokens
			logs: {
				conversations: {
					messages: 0,
					conversations: 0,
					rest: 0,
					errors: 0,
					info: 0,
					userTrack: 0,
					captcha: 0,
					api: 0,
					conversationsTrack: 0,
				}, // Conversation identifiers, for the group bot
			},
			conversations: [], // Array of chatIDs of group conversations
		}, // Group
		subGroups: [], // Array of subgroups
		groupReposts: {
			tokens: [], // Array of group tokens for repost
			chats: [], // Peer ID of chats for repost from slave account
		},
	},
	DBMS: {
		mongo: {
			login: "", // Mongo DB login
			password: "", // Mongo DB password
			address: "", // Adress to MongoDB
			database: {
				user: {
					name: "", // UserBot database name
				},
				group: {
					name: "", // GroupBot database name
				},
				main: {
					name: "", // Main database name
				},
			},
		},
	},
	rucaptcha: {
		token: "", // RuCaptcha token
	},
	paymentDetails: {
		Tinkoff: "https://vk.cc/c5lVxz",
		YooMoney: "https://vk.cc/c5lVBr",
		QIWI: "https://vk.cc/c5lVC5",
		"VK Pay": "https://vk.cc/c5D3cE",
	}, // Object with payment details (template)
};

export default config;

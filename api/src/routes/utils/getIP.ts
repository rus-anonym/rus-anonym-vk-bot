import server from "../../lib/server";

server.get("/utils.getIP", async (request, reply) => {
	return {
		ip: request.ip,
	};
});

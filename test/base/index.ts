import {zod} from "@duplojs/duplojs";
import {workerTesting} from "@duplojs/worker-testing";

export default workerTesting(
	__dirname + "/route.ts",
	[
		{
			title: "query string",
			url: "http://localhost:1506/request/1",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "GET",
				query: {
					test: "testQuery"
				}
			},
			response: {
				code: 200,
				info: "s",
				body: zod.literal("testQuery")
			}
		},
		{
			title: "query string array",
			url: "http://localhost:1506/request/2",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "GET",
				query: {
					test: ["testQuery", "toto"]
				}
			},
			response: {
				code: 200,
				info: "s",
				body: zod.array(zod.string())
			}
		},
		{
			title: "params url",
			url: "http://localhost:1506/request/3/{test}",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "GET",
				params: {
					test: "toto"
				}
			},
			response: {
				code: 200,
				info: "s",
				body: zod.literal("toto")
			}
		},
		{
			title: "header",
			url: "http://localhost:1506/request/4",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "GET",
				headers: {
					test: "toto"
				}
			},
			response: {
				code: 200,
				info: "s",
				body: zod.literal("toto")
			}
		},
		{
			title: "json body",
			url: "http://localhost:1506/request/5",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "POST",
				body: {
					test: "toto"
				}
			},
			response: {
				code: 200,
				info: "s",
				body: zod.literal("toto")
			}
		},
		{
			title: "string body",
			url: "http://localhost:1506/request/6",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "POST",
				body: "toto"
			},
			response: {
				code: 200,
				info: "s",
				body: zod.literal("toto")
			}
		},
	]
);

import {zod} from "@duplojs/duplojs";
import {workerTesting} from "@duplojs/worker-testing";

export default workerTesting(
	__dirname + "/route.ts",
	[
		{
			title: "hook info",
			url: "http://localhost:1506/request/1",
			method: "POST",
			output: ["hook info s http://localhost:1506/test/1"],
			response: {
				code: 200,
				info: "s",
			}
		},
		{
			title: "hook code",
			url: "http://localhost:1506/request/2",
			method: "POST",
			output: ["hook code 202 http://localhost:1506/test/2"],
			response: {
				code: 202,
			}
		},
		{
			title: "hook error",
			url: "http://localhost:1506/request/error",
			method: "POST",
			output: ["hook error https://localhost:1506/test/error"],
			response: {
				code: 500,
			}
		},
	]
);

import {zod} from "@duplojs/duplojs";
import {workerTesting} from "@duplojs/worker-testing";

export default workerTesting(
	__dirname + "/route.ts",
	[
		{
			title: "interceptore",
			url: "http://localhost:1506/request/test/1",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "GET",
			},
			output: [
				"requestInterceptor http://localhost:1506/test/1", 
				"responseInterceptor http://localhost:1506/test/1"
			],
			response: {
				code: 200,
				info: "s",
			}
		},
		{
			title: "interceptore params",
			url: "http://localhost:1506/request/test/1",
			method: "POST",
			headers: {"content-type": "application/json"},
			body: {
				method: "GET",
				interceptorParams: {test: "toto"}
			},
			output: [
				"requestInterceptor http://localhost:1506/test/1", 
				"requestInterceptor params {\"test\":\"toto\"}",
				"responseInterceptor http://localhost:1506/test/1",
				"responseInterceptor params {\"test\":\"toto\",\"added\":true}"
			],
			response: {
				code: 200,
				info: "s",
			}
		},
	]
);

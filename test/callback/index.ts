import {zod} from "@duplojs/duplojs";
import {workerTesting} from "@duplojs/worker-testing";

export default workerTesting(
	__dirname + "/route.ts",
	[
		{
			title: "s",
			url: "http://localhost:1506/request/1",
			method: "POST",
			output: [
				"then true",
				"s {\"test\":true}"
			],
			response: {
				code: 200,
			}
		},
		{
			title: "e",
			url: "http://localhost:1506/request/",
			method: "POST",
			output: [
				"then true",
				"e \"test\""
			],
			response: {
				code: 409,
			}
		},
		{
			title: "code",
			url: "http://localhost:1506/request/2",
			method: "POST",
			output: [
				"then true",
				"code {\"test\":true}",
				"s {\"test\":true}",
			],
			response: {
				code: 202,
			}
		},
		{
			title: "info",
			url: "http://localhost:1506/request/3",
			method: "POST",
			output: [
				"then true",
				"info {\"test\":true}",
				"s {\"test\":true}",
			],
			response: {
				code: 200,
			}
		},
		{
			title: "catch",
			url: "http://localhost:1506/request/error",
			method: "POST",
			output: ["error true"],
			response: {
				code: 500,
			}
		},
	]
);

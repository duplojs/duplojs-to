import {workersTesting} from "@duplojs/worker-testing";

workersTesting(
	(path) => import(path),
	__dirname + "/base",
	__dirname + "/interceptor",
	__dirname + "/hook",
	__dirname + "/callback",
);

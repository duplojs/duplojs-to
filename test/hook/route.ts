import Duplo, {zod} from "@duplojs/duplojs";
import {parentPort} from "worker_threads";
import DuploTo from "../../scripts";
import duploTypeGenerator from "../../scripts/plugin";

const duplo = Duplo({port: 1506, host: "localhost", environment: "DEV"});
duplo.use(duploTypeGenerator);
const duploTo = new DuploTo({host: "localhost:1506", https: false, prefix: "test"});
duploTo.addHookInfo("s", (request) => {
	parentPort?.postMessage("hook info s " + request.url);
});
duploTo.addHookCode(202, (request) => {
	parentPort?.postMessage("hook code 202 " + request.url);
});
duploTo.addHookError((request) => {
	parentPort?.postMessage("hook error " + request.url);
});

duplo.declareRoute("POST", "/request/*")
.cut(({}, res, request) => ({request}), ["request"])
.handler(async({pickup}, res) => {
	const request = pickup("request");
	const path = decodeURI(request.url.split("/").slice(2).join("/"));
	if(path === "error"){
		//@ts-ignore
		duploTo.https = true;
		//@ts-ignore
		duploTo.setBaseUrl();
	}

	const result = await duploTo.request(
		path,
		{
			method: "GET"
		}
	)
	.result;

	if(!result.success){
		res.code(500).info("error").send();
		return;
	}

	res.code(result.response?.status || 500).info(result.info || "error").send(result.data);
});

duplo.declareRoute("GET", "/test/1")
.handler(async({pickup}, res) => {
	res.info("s").send();
});

duplo.declareRoute("GET", "/test/2")
.handler(async({pickup}, res) => {
	res.code(202).send();
});

duplo.launch(() => parentPort?.postMessage("ready"));

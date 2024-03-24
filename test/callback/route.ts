import Duplo, {zod} from "@duplojs/duplojs";
import {parentPort} from "worker_threads";
import DuploTo from "../../scripts";
import duploTypeGenerator from "../../scripts/plugin";

const duplo = Duplo({port: 1506, host: "localhost", environment: "DEV"});
duplo.use(duploTypeGenerator);
const duploTo = new DuploTo({host: "localhost:1506", https: false, prefix: "test/"});

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
			method: "GET",
		}
	)
	.s((data) => {
		parentPort?.postMessage("s " + JSON.stringify(data));
	})
	.e((data) => {
		parentPort?.postMessage("e " + JSON.stringify(data));
	})
	.code(202, (data) => {
		parentPort?.postMessage("code " + JSON.stringify(data));
	})
	.info("s", (data) => {
		parentPort?.postMessage("info " + JSON.stringify(data));
	})
	.then((response) => {
		parentPort?.postMessage("then " + !!response.response);
	})
	.catch((error) => {
		parentPort?.postMessage("error " + (error instanceof Error));
	})
	.result;

	if(!result.success){
		res.code(500).info("error").send();
		return;
	}

	res.code(result.response?.status || 500).info(result.info || "").send(result.data);
});

duplo.declareRoute("GET", "/test")
.handler(async({}, res) => {
	res.code(409).send("test");
});

duplo.declareRoute("GET", "/test/1")
.handler(async({}, res) => {
	res.send({test: true});
});

duplo.declareRoute("GET", "/test/2")
.handler(async({}, res) => {
	res.code(202).send({test: true});
});

duplo.declareRoute("GET", "/test/3")
.handler(async({}, res) => {
	res.info("s").send({test: true});
});

duplo.launch(() => parentPort?.postMessage("ready"));

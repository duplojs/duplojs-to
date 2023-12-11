import Duplo, {zod} from "@duplojs/duplojs";
import {parentPort} from "worker_threads";
import DuploTo from "../../scripts";

const duplo = Duplo({port: 1506, host: "localhost"});
const duploTo = new DuploTo({host: "localhost:1506", https: false});
duploTo.setRequestInterceptor((request, params) => {
	parentPort?.postMessage("requestInterceptor " + request.url);
	if(params){
		parentPort?.postMessage("requestInterceptor params " + JSON.stringify(params));
		params.added = true;
	}
	return request;
});
duploTo.setResponseInterceptor((response, request, params) => {
	parentPort?.postMessage("responseInterceptor " + request.url);
	if(params){
		parentPort?.postMessage("responseInterceptor params " + JSON.stringify(params));
	}
	return response;
});

duplo.declareRoute("POST", "/request/*")
.hook("onError", (req, res, err) => console.log(err))
.extract(
	{
		body: {
			method: zod.enum([
				"GET", "POST", "PATCH", "PUT", "HEAD", "OPTIONS", "DELETE"
			]),
			interceptorParams: zod.any().optional(),
		}
	},
	(res, type, index, err) => {
		console.log(err);
		res.code(400).info("error").send();
	}
)
.cut(({}, res, request) => ({request}), ["request"])
.handler(async({pickup}, res) => {
	const request = pickup("request");
	const path = decodeURI(request.url.split("/").slice(2).join("/"));
	
	const result = await duploTo.request(
		path,
		{
			method: pickup("method"),
		},
		pickup("interceptorParams")
	)
	.result;

	res.code(result.response?.status || 500).info(result.info || "error").send(result.data);
});

duplo.declareRoute("GET", "/test/1")
.handler(async({}, res) => {
	res.info("s").send();
});

duplo.launch(() => parentPort?.postMessage("ready"));

import Duplo, {zod} from "@duplojs/duplojs";
import {parentPort} from "worker_threads";
import DuploTo from "../../scripts";
import duploTypeGenerator from "../../scripts/plugin";

const duplo = Duplo({port: 1506, host: "localhost", environment: "DEV"});
duplo.use(duploTypeGenerator);
const duploTo = new DuploTo<{}, DuploTo>({host: "localhost:1506", https: false, prefix: "/test/"});
duploTo.setDefaultHeaders({
	tt: undefined,
	test: "toto"
});

duplo.declareRoute("POST", "/request/*")
.hook("onError", (req, res, err) => console.log(err))
.extract(
	{
		body: {
			method: zod.enum([
				"GET", "POST", "PATCH", "PUT", "HEAD", "OPTIONS", "DELETE"
			]),
			body: zod.any().optional(),
			params: zod.any().optional(),
			query: zod.any().optional(),
			headers: zod.any().optional(),
			other: zod.any().optional(),
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
	
	const result = await duploTo.enriched.request(
		path,
		{
			method: pickup("method"),
			body: pickup("body"),
			params: pickup("params"),
			query: pickup("query"),
			headers: pickup("headers"),
			...pickup("other")
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
.extract({
	query: {
		test: zod.string(),
	}
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("test"));
});

duplo.declareRoute("GET", "/test/2")
.extract({
	query: {
		test: zod.array(zod.string()),
	}
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("test"));
});

duplo.declareRoute("GET", "/test/3/{test}")
.extract({
	params: {
		test: zod.string(),
	}
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("test"));
});

duplo.declareRoute("GET", "/test/4")
.extract({
	headers: {
		test: zod.string(),
	}
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("test"));
});

duplo.declareRoute("POST", "/test/5")
.extract({
	body: {
		test: zod.string(),
	}
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("test"));
});

duplo.declareRoute("POST", "/test/6")
.extract({
	body: zod.string()
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("body"));
});

duplo.declareRoute("POST", "/test/7")
.extract({
	body: zod.string()
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("body"));
});

duplo.declareRoute("POST", "/test/8")
.extract({
	headers: {
		tt: zod.undefined(),
		test: zod.literal("toto"),
	}
})
.handler(async({pickup}, res) => {
	res.info("s").send(pickup("test"));
});

duplo.launch(() => parentPort?.postMessage("ready"));

import Duplo, {zod} from "@duplojs/duplojs";
import {parentPort} from "worker_threads";
import duploTypeGenerator from "../../scripts/plugin";
import {IHaveSentThis} from "@duplojs/what-was-sent";

const duplo = Duplo({port: 1506, host: "localhost", environment: "DEV"});

duplo.use(duploTypeGenerator, {outputFile: "./test/plugin/EnrichedDuploTo.ts"});

const mustBeAdmin = duplo.declareAbstractRoute("MustBeAdmin")
.extract({
	headers: {
		token: zod.string().ignore(),
		test: zod.string().optional(),
	}
})
.build();

mustBeAdmin()
.declareRoute("GET", "/user/{id}")
.extract({
	params: {
		id: zod.coerce.number(),
	}
})
.handler(
	({}, res) => {
		res.code(200).info("user.get").send({firstname: "mathieu"});
	},
	new IHaveSentThis(404, "users.notfound"),
	new IHaveSentThis(200, "user.get", zod.object({firstname: zod.string()}).setIdentifier("User"))
);

duplo.declareRoute("GET", "/users")
.handler(
	({}, res) => {
		res.code(200).info("users.get").send([{firstname: "mathieu"}]);
	},
	new IHaveSentThis(200, "users.get", zod.object({firstname: zod.string()}).array())
);

duplo.declareRoute("POST", "/user/{id}")
.extract({
	params: {
		id: zod.coerce.number(),
	},
	body: zod.object({
		firstname: zod.string(),
	}).setIdentifier("User")
})
.handler(
	({}, res) => {
		res.code(200).info("user.post").send();
	},
	new IHaveSentThis(404, ["users.notfound", "org.notfound"]),
	new IHaveSentThis(200, "user.post")
);


duplo.declareRoute("PATCH", "/user/{id}")
.extract({
	params: {
		id: zod.coerce.number().optional(),
	},
})
.handler(
	({}, res) => {
		res.code(200).info("user.patch").send();
	},
	new IHaveSentThis(200, "user.patch")
);

duplo.declareRoute("GET", "/posts")
.handler(
	({}, res) => {
		res.code(200).info("posts.get").send();
	},
);

duplo.launch(() => parentPort?.postMessage("ready"));

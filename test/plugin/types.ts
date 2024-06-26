import {date} from "zod";
import DuploTo from "../../scripts";
import {EnrichedDuploTo, GetDef, GetResponseByInfo, GetResponseByCode} from "./EnrichedDuploTo";

type AssertType<T, B extends T> = null

type interceptorParameter = {test: boolean};

const duploTo = new DuploTo<
	interceptorParameter, 
	EnrichedDuploTo<interceptorParameter>
>({host: "localhost:1506", https: false});

duploTo.enriched.get(
	"/user/{id}",
	{params: {id: 1}}
)
.e(data => {
	type test = AssertType<undefined, typeof data>;
})
.s(data => {
	type test = AssertType<{firstname: string}, typeof data>;
})
.info("user.get", data => {
	type test = AssertType<{firstname: string}, typeof data>;
})
.info("users.notfound", data => {
	type test = AssertType<undefined, typeof data>;
})
.info(["user.get", "users.notfound"], (data, info) => {
	if(info === "user.get"){
		type test = AssertType<{firstname: string}, typeof data>;
	}
	else {
		type test = AssertType<undefined, typeof data>;
	}
})
.code(200, data => {
	type test = AssertType<{firstname: string}, typeof data>;
})
.code(404, data => {
	type test = AssertType<undefined, typeof data>;
})
.code([404, 200], (data, code) => {
	if(code === 200){
		type test = AssertType<{firstname: string}, typeof data>;
	}
	else {
		type test = AssertType<undefined, typeof data>;
	}
})
.then(data => {
	type test = AssertType<{
		success: true;
		response: Response;
		data: undefined;
		info: "users.notfound";
		code: 404;
	} | {
		success: true;
		response: Response;
		data: {firstname: string};
		info: "user.get";
		code: 200;
	}, typeof data>;
})
.result
.then(result  => {
	type test = AssertType<{
		success: true;
		response: Response;
		data: undefined;
		info: "users.notfound";
		code: 404;
	} | {
		success: true;
		response: Response;
		data: {firstname: string};
		info: "user.get";
		code: 200;
	} | {
		success: false,
		error: Error,
	}, typeof result>;
});

const testData = duploTo.enriched.get(
	"/user/{id}",
	{
		headers: {test: "tt"},
		params: {id: 1}
	}
);

testData.sd().then(data => {
	type test = AssertType<{firstname: string}, typeof data>;
});

testData.ed().then(data => {
	type test = AssertType<undefined, typeof data>;
});

testData.id("user.get").then(data => {
	type test = AssertType<{firstname: string}, typeof data>;
});

testData.id(["user.get", "users.notfound"]).then(data => {
	type test = AssertType<{firstname: string} | undefined, typeof data>;
});

testData.cd(404).then(data => {
	type test = AssertType<undefined, typeof data>;
});

testData.cd([404, 200]).then(data => {
	type test = AssertType<{firstname: string} | undefined, typeof data>;
});

duploTo.enriched.get(
	"/users",
	undefined,
	{test: true}
);

duploTo.enriched.get(
	"/users"
);

duploTo.enriched.get(
	"/users",
	{headers: []}
);

duploTo.enriched.post(
	"/user/{id}",
	{firstname: "mathieu"},
	{params: {id: 1}}
)
.info(["user.post", "org.notfound"], (data, info) => {
	type test = AssertType<undefined, typeof data>;
	type test1 = AssertType<"org.notfound" | "user.post", typeof info>;
});

duploTo.enriched.patch(
	"/user/{id}", 
	undefined
);

duploTo.enriched.patch(
	"/user/{id}", 
	undefined, 
	{params: {id: 1}}
).then(payload => {
	type test = AssertType<typeof payload["code"], number>;
});

duploTo.enriched.get("/posts").code(3000, (data: string) => {
	type test = AssertType<string, typeof data>;
});

type test = AssertType<"get" | "post" | "patch", keyof EnrichedDuploTo>
& AssertType<{path: "/user/{id}", method: "POST"}, GetDef<"POST", "/user/{id}">>
& AssertType<
	{info: "user.get"},
	GetResponseByInfo<
		GetDef<"GET", "/user/{id}">,
		"user.get"
	>
>
& AssertType<
	{code: 200},
	GetResponseByCode<
		GetDef<"GET", "/user/{id}">,
		200
	>
>;

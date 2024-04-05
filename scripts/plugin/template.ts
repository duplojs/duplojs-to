export const baseInterfaceTemplate = (block: string) => /* js */`
export type BaseRequestParameters = {
	disabledPrefix?: boolean;
} & Omit<RequestInit, "headers" | "method">;

export type RequestCallbackError = (error: Error) => void

export type ResponseObjectError = {
	success: false,
	error: Error,
}

export interface ResponseDefinition {
	code: number;
	ok: boolean;
	info?: string;
	body?: any;
}

export type RepDefToResponseObject<repDef extends ResponseDefinition> = 
	repDef extends ResponseDefinition 
		? {
			success: true,
			response: Response,
			data: repDef["body"],
			info: repDef["info"],
			code: repDef["code"]
		}
		: never

export declare class EnrichedRequestor<
	repDef extends ResponseDefinition
>{

	s(cb: (data: Extract<repDef, {ok: true}>["body"]) => void): this;
	sd(): Promise<
		Extract<repDef, {ok: true}>["body"]
	>;

	e(cb: (data: Extract<repDef, {ok: false}>["body"]) => void): this;
	ed(): Promise<
		Extract<repDef, {ok: false}>["body"]
	>;

	info<_info extends repDef["info"]>(
		info: _info,
		cb: (data: Extract<repDef, {info: _info}>["body"]) => void
	): this;
	id<_info extends repDef["info"]>(info: _info): Promise<
		Extract<repDef, {info: _info}>["body"]
	>;

	code<_code extends repDef["code"]>(
		code: _code,
		cb: (data: Extract<repDef, {code: _code}>["body"]) => void
	): this;
	cd<_code extends repDef["code"]>(code: _code): Promise<
		Extract<repDef, {code: _code}>["body"]
	>;

	then(cb: (response: RepDefToResponseObject<repDef>) => void): this;
	catch(cb: RequestCallbackError): this;
	finally(cb: (response: RepDefToResponseObject<repDef> | ResponseObjectError) => void): this;
	result: Promise<
		| RepDefToResponseObject<repDef>
		| ResponseObjectError
	>;
}

export interface EnrichedDuplojsTo<
	interceptorParameter extends {} = {},
>{
	${block}
}
`;

export const takesMethodTemplate = (
	method: string, 
	path: string, 
	parametersTypeName: string, 
	optionalParameters: boolean,
	responseTypesNames: string
) => /* js */`
	${method}(
		path: ${path}, 
		parameters ${optionalParameters ? "?" : ""}: ${parametersTypeName},
		interceptorParams?: interceptorParameter
	): EnrichedRequestor<
		${responseTypesNames}
	>
`;

export const givesMethodTemplate = (
	method: string, 
	path: string,
	bodyTypeName: string,
	parametersTypeName: string,
	optionalParameters: boolean,
	responseTypesNames: string
) => /* js */`
	${method}(
		path: ${path}, 
		body: ${bodyTypeName},
		parameters ${optionalParameters ? "?" : ""}: ${parametersTypeName},
		interceptorParams?: interceptorParameter
	): EnrichedRequestor<
		${responseTypesNames}
	>
`;

export const baseDefTemplate = (block: string) => /* js */`
export type GetDef<
	method extends DefEnrichedDuplojsTo["method"],
	path extends Extract<
		DefEnrichedDuplojsTo, 
		{method: method}
	>["path"] = any, 
> = Extract<
	DefEnrichedDuplojsTo, 
	{
		method: method,
		path: path
	}
>;

export type DefDefinition = {
	path: string,
	method: string,
	body: unknown,
	parameters: unknown,
	response: ResponseDefinition,
}

export type GetResponseByInfo<
	def extends DefDefinition,
	info extends def["response"]["info"]
> = Extract<
	def["response"], 
	{
		info: info
	}
>;

export type GetResponseByCode<
	def extends DefDefinition,
	code extends def["response"]["code"]
> = Extract<
	def["response"], 
	{
		code: code
	}
>;

export type DefEnrichedDuplojsTo = ${block};
`;

export const defRouteTemplate = (
	method: string, 
	path: string,
	bodyTypeName: string,
	parametersTypeName: string,
	responseTypesNames: string
) => /* js */`{
	path: ${path},
	method: "${method}",
	body: ${bodyTypeName},
	parameters: ${parametersTypeName},
	response: ${responseTypesNames},
}`;

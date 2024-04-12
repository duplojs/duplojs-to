export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

export type RequestParameters = {
	method?: HttpMethod;
	params?: Record<string, string | number>;
	query?: Record<string, string | string[] | number | undefined>;
	disabledPrefix?: boolean;
	headers?: Record<string, string | undefined>;
} & Omit<RequestInit, "headers" | "method">;

export type RequestObject = {
    url: string
    parameters: RequestParameters
}

export interface ResponseObjectInterface<_data> {}

export type ResponseObjectError = {
	success: false,
	error: Error,
}

export type ResponseObjectSuccess<_data> = {
	success: true,
	response: Response,
	code: number,
	data?: _data,
	info?: string,
}

export type ResponseObject<_data> = (
	| ResponseObjectSuccess<_data>
	| ResponseObjectError
) & ResponseObjectInterface<_data>

export type RequestInterceptorFunction<
    interceptorParameter extends Record<string, any>
> = (
    request: RequestObject, 
    params: Partial<interceptorParameter>
) => RequestObject;

export type ResponseInterceptorFunction<
    interceptorParameter extends Record<string, any>,
	data = unknown
> = (
    response: ResponseObject<data>, 
    request: RequestObject, 
    params: Partial<interceptorParameter>
) => ResponseObject<data>;

export type RequestCallbackHook<_data = unknown> = (requestObject: RequestObject, responseObject: ResponseObject<_data>) => void
export type RequestCallbackError = (error: Error) => void
export type RequestCallbackErrorHook = (requestObject: RequestObject, error: Error) => void

export interface DuplojsToParameters {
    prefix?: string;
    https?: boolean;
    host?: string;
    keyInfo?: string;
}

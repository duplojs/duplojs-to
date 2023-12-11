export type RequestParameters = {
	params?: Record<string, string | number>;
	query?: Record<string, string | string[] | number | undefined>;
	disabledPrefix?: boolean;
	headers?: Record<string, string | undefined>
} & Omit<RequestInit, "headers">;

export type RequestObject = {
    url: string
    parameters: RequestParameters
}

export type ResponseObject<data> = {
    response?: Response;
	data?: data;
	error?: Error;
	info?: string;
}

export type RequestInterceptorFunction<
    interceptorParameter extends Record<string, any>
> = (
    request: RequestObject, 
    params?: interceptorParameter
) => RequestObject;

export type ResponseInterceptorFunction<
    interceptorParameter extends Record<string, any>,
	data = unknown
> = (
    response: ResponseObject<data>, 
    request: RequestObject, 
    params?: interceptorParameter
) => ResponseObject<data>;

export type RequestCallbackHook = (requestObject: RequestObject, responseObject: ResponseObject<data>) => void
export type RequestCallbackError = (error: Error) => void
export type RequestCallbackErrorHook = (requestObject: RequestObject, error: Error) => void

export interface DuplojsToParameters {
    prefix?: string;
    https?: boolean;
    host?: string;
    keyInfo?: string;
}

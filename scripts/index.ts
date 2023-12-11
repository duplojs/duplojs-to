import Requestor from "./requestor";
import {DuplojsToParameters, RequestCallbackErrorHook, RequestCallbackHook, RequestInterceptorFunction, RequestParameters, ResponseInterceptorFunction} from "./types";

export default class DuplojsTo<
    interceptorParameter extends Record<string, any> = Record<string, any>
>{
	constructor(
		{
			prefix,
			https,
			host,
			keyInfo
		}: DuplojsToParameters = {}
	){
		this.prefix = prefix;
		this.https = https;
		this.host = host;

		this.requestor = class extends Requestor<any, any>{};
		this.setBaseUrl();
		this.requestor.keyInfo = keyInfo || this.requestor.keyInfo;
	}

	private prefix?: string;
	private https?: boolean;
	private host?: string;

	private requestor: typeof Requestor;
	private defaultHeaders: Record<string, string | number | string[] | undefined> = {};

	private setBaseUrl(){
		const host = this.host || window.location.host;
		const protocol = (() => {
			if(this.https === true) return "https:";
			else if(this.https === false) return "http:";
			else return window.location.protocol;
		})();
		const prefix = (() => {
			let prefix = this.prefix || "";
			if(!prefix.startsWith("/"))prefix = `/${prefix}`;
			if(prefix.endsWith("/"))prefix = prefix.slice(0, -1);
			return prefix;
		})(); 
		
		this.requestor.baseUrl = `${protocol}//${host}${prefix}`;
		this.requestor.baseUrlWithoutPrefix = `${protocol}//${host}`;
	}

	setDefaultHeaders(headers: Record<string, string | number | string[] | undefined>){
		this.defaultHeaders = headers;
		return this;
	}

	setRequestInterceptor(requestInterceptor: RequestInterceptorFunction<interceptorParameter>){
		this.requestor.requestInterceptor = requestInterceptor;
		return this;
	}
	setResponseInterceptor(responseInterceptor: ResponseInterceptorFunction<interceptorParameter>){
		this.requestor.responseInterceptor = responseInterceptor;
		return this;
	}

	addHookInfo(info: string, cb: RequestCallbackHook){
		if(!this.requestor.hookInfo[info]){
			this.requestor.hookInfo[info] = [];
		}
		this.requestor.hookInfo[info].push(cb);
		return this;
	}
	removeHookInfo(info: string, cb: RequestCallbackHook){
		if(!this.requestor.hookInfo[info]){
			const index = this.requestor.hookInfo[info].findIndex(sub => sub === cb);
			if(index !== -1){
				this.requestor.hookInfo[info].splice(index, 1);
			}
		}
		return this;
	}

	addHookCode(code: number, cb: RequestCallbackHook){
		if(!this.requestor.hookCode[code]){
			this.requestor.hookCode[code] = [];
		}
		this.requestor.hookCode[code].push(cb);
		return this;
	}
	removeHookCode(code: number, cb: RequestCallbackHook){
		if(!this.requestor.hookCode[code]){
			const index = this.requestor.hookCode[code].findIndex(sub => sub === cb);
			if(index !== -1){
				this.requestor.hookCode[code].splice(index, 1);
			}
		}
		return this;
	}

	addHookError(cb: RequestCallbackErrorHook){
		this.requestor.hookError.push(cb);
		return this;
	}
	removeHookError(cb: RequestCallbackErrorHook){
		const index = this.requestor.hookError.findIndex(sub => sub === cb);
		if(index !== -1){
			this.requestor.hookError.splice(index, 1);
		}
		return this;
	}

	request<data = unknown>(path: string, parameters: RequestParameters = {}, interceptorParams?: interceptorParameter){
		if(!parameters.headers) parameters.headers = {};
		if(parameters.body && !parameters.headers["content-type"]){
			if(typeof parameters.body === "string"){
				parameters.headers["content-type"] = "text/plain; charset=utf-8";
			}
			else if(
				typeof parameters.body === "object" && 
                !(parameters.body instanceof FormData)
			){
				parameters.headers["content-type"] = "application/json; charset=utf-8";
				parameters.body = JSON.stringify(parameters.body);
			}
		}
		Object.entries(this.defaultHeaders).forEach(
			([key, value]) => (parameters.headers as any)[key] = value
		);

		return new this.requestor<interceptorParameter, data>(
			path, 
			parameters, 
			interceptorParams
		);
	}

	get<data = unknown>(path: string, parameters: RequestParameters = {}, interceptorParams?: interceptorParameter){
		parameters.method = "GET";
		return this.request<data>(path, parameters, interceptorParams);
	}
	head<data = unknown>(path: string, parameters: RequestParameters = {}, interceptorParams?: interceptorParameter){
		parameters.method = "HEAD";
		return this.request<data>(path, parameters, interceptorParams);
	}
	options<data = unknown>(path: string, parameters: RequestParameters = {}, interceptorParams?: interceptorParameter){
		parameters.method = "OPTIONS";
		return this.request<data>(path, parameters, interceptorParams);
	}
	delete<data = unknown>(path: string, parameters: RequestParameters = {}, interceptorParams?: interceptorParameter){
		parameters.method = "DELETE";
		return this.request<data>(path, parameters, interceptorParams);
	}
	post<data = unknown>(
		path: string, 
		body?: any,
		parameters: RequestParameters = {}, 
		interceptorParams?: interceptorParameter
	){
		parameters.method = "POST";
		parameters.body = body;
		return this.request<data>(path, parameters, interceptorParams);
	}
	put<data = unknown>(
		path: string, 
		body?: any,
		parameters: RequestParameters = {}, 
		interceptorParams?: interceptorParameter
	){
		parameters.method = "PUT";
		parameters.body = body;
		return this.request<data>(path, parameters, interceptorParams);
	}
	patch<data = unknown>(
		path: string, 
		body?: any,
		parameters: RequestParameters = {}, 
		interceptorParams?: interceptorParameter
	){
		parameters.method = "PATCH";
		parameters.body = body;
		return this.request<data>(path, parameters, interceptorParams);
	}
}

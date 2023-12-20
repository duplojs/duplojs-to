import {RequestCallbackError, RequestCallbackErrorHook, RequestCallbackHook, RequestInterceptorFunction, RequestParameters, ResponseInterceptorFunction, ResponseObject} from "./types";

export default class Requestor<
    interceptorParameter extends Record<string, any> = Record<string, any>,
	data = unknown
>{
	constructor(
		path: string, 
		requestParameters: RequestParameters, 
		interceptorParams: interceptorParameter
	){
		this.result = this.setResult(path, requestParameters, interceptorParams);
	}

	static requestInterceptor: RequestInterceptorFunction<any> = request => request;
	static responseInterceptor: ResponseInterceptorFunction<any> = response => response;
	static baseUrl = "";
	static baseUrlWithoutPrefix = "";
	static keyInfo = "info";
	static hookInfo: Record<string, RequestCallbackHook[]> = {};
	static hookCode: Record<number, RequestCallbackHook[]> = {};
	static hookError: RequestCallbackErrorHook[] = [];
	get construc(){
		return this.constructor as any as typeof Requestor;
	}

	result: Promise<ResponseObject<data>>;
	private _s: (data: any) => void = () => {};
	private _e: (data: any) => void = () => {};
	private _info: Record<string, (data: any) => void> = {};
	private _code: Record<number, (data: any) => void> = {};
	private _then: (data: any) => void = () => {};
	private _catch: RequestCallbackError = (error) => {throw error;};
	private _finally: (...args: any[]) => void = () => {};

	s<d = data>(cb: (data: d) => void){
		this._s = cb;
		return this;
	}
	async sd<d = data>(){
		let result = await this.result;
		if(result.response?.ok === true) return result.data as d;
		else throw new Error("Wrong Response");
	}
	e<d = data>(cb: (data: d) => void){
		this._e = cb;
		return this;
	}
	async ed<d = data>(){
		let result = await this.result;
		if(result.response?.ok === false) return result.data as d;
		else throw new Error("Wrong Response");
	}
	info<d = data>(info: string, cb: (data: d) => void){
		this._info[info] = cb;
		return this;
	}
	async id<d = data>(info: string){
		let result = await this.result;
		if(result.info === info) return result.data as d;
		else throw new Error("Wrong Response");
	}
	code<d = data>(code: number, cb: (data: d) => void){ 
		this._code[code] = cb;
		return this;
	}
	async cd<d = data>(code: number){
		let result = await this.result;
		if(result.response?.status === code) return result.data as d;
		else throw new Error("Wrong Response");
	}
	then<d = data>(cb: (response: ResponseObject<d>) => void){
		this._then = cb;
		return this;
	}
	catch(cb: Requestor["_catch"]){
		this._catch = cb;
		return this;
	}
	finally(cb: (response: ResponseObject<data>) => void){
		this._finally = cb;
		return this;
	}

	private async setResult(
		path: string, 
		requestParameters: RequestParameters, 
		interceptorParams: interceptorParameter
	){
		const baseUrl = requestParameters.disabledPrefix ? this.construc.baseUrlWithoutPrefix : this.construc.baseUrl;
		if(!path.startsWith("/"))path = `/${path}`;
		const url = `${baseUrl}${path}`;

		const requestObject = this.construc.requestInterceptor(
			{url, parameters: requestParameters}, 
			interceptorParams
		);
		const responseObject = this.construc.responseInterceptor(
			await this.fetch(url, requestParameters),
			requestObject,
			interceptorParams
		);

		try {
			if(responseObject.error){
				this.construc.hookError.forEach(sub => sub(requestObject, responseObject.error as Error));
				this._catch(responseObject.error);
			}
			else if(responseObject.response){
				this._then(responseObject);
    
				if(this.construc.hookCode[responseObject.response.status]){
					this.construc.hookCode[responseObject.response.status].forEach(
						sub => sub(requestObject, responseObject)
					);
				}
				if(this._code[responseObject.response.status]){
					this._code[responseObject.response.status](responseObject.data);
				}
    
				const info = responseObject.info;
				if(info){
					if(this.construc.hookInfo[info]){
						this.construc.hookInfo[info].forEach(sub => sub(requestObject, responseObject));
					}
					if(this._info[info]) this._info[info](responseObject.data);
				}
				
				if(responseObject.response.ok) this._s(responseObject.data);
				else this._e(responseObject.data);
			}
		}
		finally {
			this._finally(responseObject);
		}
        
		return responseObject as ResponseObject<data>;
	}

	private async fetch(url: string, requestParameters: RequestParameters){
		if(requestParameters.disabledPrefix) delete requestParameters.disabledPrefix;
		if(requestParameters.params){
			let urls = url.split("?");
			Object.entries(requestParameters.params).forEach(
				([key, value]) => urls[0] = urls[0].replace(`{${key}}`, value.toString())
			);
			delete requestParameters.params;
			url = urls.join("?");
		}
		if(requestParameters.query){
			let urls = url.split("?");
			let query: string[] = [];
			Object.entries(requestParameters.query).forEach(
				([key, value]) => {
					if(!value) return;
					else if(Array.isArray(value))value.forEach(v => query.push(`${key}=${v}`));
					else query.push(`${key}=${value}`);
				}
			);
			delete requestParameters.query;
			url = urls[0] + "?" + query.join("&") + (urls[1] ? "&" + urls[1] : "");
		}

		try {
			const response = await fetch(url, requestParameters as any);
			const responseContentType = response.headers.get("content-type") || "";
			const info = response.headers.get(this.construc.keyInfo) || undefined;
			let data: any = undefined;

			if(responseContentType.indexOf("application/json") !== -1) data = await response.json();
			else if(responseContentType.indexOf("text/") !== -1) data = await response.text();
			else data = await response.blob();

			return {response, data, info};
		}
		catch (error){
			return {error: error as Error};
		}
	}
}

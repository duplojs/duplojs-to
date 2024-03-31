# duplojs-to
[![NPM version](https://img.shields.io/npm/v/@duplojs/to)](https://www.npmjs.com/package/@duplojs/to)

DuploJSTo est un client HTTP qui facilite la communication avec une API [DuploJS](https://github.com/duplojs/duplojs). Le package intégre aussi un plugin Duplo qui permet de générer une déclaration des enrtés et des sortie de votre back-end.

## Instalation
```
npm i @duplojs/to
```

## Initialisation
```ts
import DuploTo from "@duplojs/to";

// client http
const duploTo = new DuploTo({/* config */});
```

#### Config
propriétés|valeur|definition
---|---|---
prefix|`string` \| `undefined`|Définis un prefix qui sera utilisé pour chacune des request
https|`boolean` \| `undefined`|Si `true`, Cela utilisera le protocole https. Si `false`, ce sera le protocole http qui sera utilisé. Dans le cas ou il n'est pas défini, le protocole utilisé sera celui actuelle de la page.
host|`string` \| `undefined`| définis l'host des requests. Exemple : `"www.youtube.com"`, Et si la propriété n'est pas défini, la valeur par défaut, sera l'host de la page actuelle.
keyInfo|`string` \| `undefined`|La clé pour trouver l'info dans les headers. Valeur pars défaut `"info"`.

## instance DuploTo
#### Propriété de l'instance
propriétés|valeur|definition
---|---|---
request|`request(path: string, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request HTTP.
get|`get(path: string, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request GET HTTP.
head|`head(path: string, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request HEAD HTTP.
options|`options(path: string, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request OPTIONS HTTP.
delete|`delete(path: string, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request DELETE HTTP.
post|`post(path: string, body?: any, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request POST HTTP.
put|`put(path: string, body?: any, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request PUT HTTP.
patch|`patch(path: string, body?: any, parameters?: RequestParameters, interceptorParams?: interceptorParameter): Requestor;`|Permet de faire une request PATCH HTTP.
setDefaultHeaders|`setDefaultHeaders(headers: Record<string, string \| number \| string[] \| undefined>): this;`|Serre a définir des headers qui seront envoyer a chaque request.
setRequestInterceptor|`setRequestInterceptor(requestInterceptor: (request: RequestObject, params: interceptorParameter) => RequestObject): this;`|Définit une fonction qui permet d'intercepter les donner des request. Elle ce lance avand l'envoi de la request. Cela serre a modifer les données ou a pour effectué des action a ce moment la.
setResponseInterceptor|`setResponseInterceptor(responseInterceptor: (response: ResponseObject, request: RequestObject, params: interceptorParameter) => ResponseObject): this;`|Définit une fonction qui permet d'intercepter les donner des réponses. Elle ce lance juste aprés que la request sois terminer et avand le traitement pars le client. Cela serre a modifer les données ou a pour effectué des action a ce moment la.
addHookInfo|`addHookInfo(info: string, cb: (requestObject: RequestObject, responseObject: ResponseObject) => void): this;`|Permet d'ajouter une fonction qui ce lencera quand une request portera l'info passer en premier argument.
removeHookInfo|`removeHookInfo(info: string, cb: AnyFunction): this;`|Permet de retiré une fonction qui a étais utilisé comme hook.
addHookCode|`addHookCode(code: number, cb: (requestObject: RequestObject, responseObject: ResponseObject) => void): this;`|Permet d'ajouter une fonction qui ce lencera quand une request portera le code passer en premier argument.
removeHookCode|`removeHookCode(code: number, cb: AnyFunction): this;`|Permet de retiré une fonction qui a étais utilisé comme hook.
addHookError|`addHookError(cb: (error: Error) => void): this;`|Permet d'ajouter une fonction qui ce lencera quand une request sera en echec.
removeHookError|`removeHookError(cb: AnyFunction): this;`|Permet de retiré une fonction qui a étais utilisé comme hook.
enriched|`this;`|Cette propriéter permet d'accerdé l'instance typé du client.

#### Exemple configuration
```ts
interface InterceptorParams{
	enabledLoader?: boolean
}

const duploTo = new DuploTo<InterceptorParams>();

duploTo.setRequestInterceptor((request, params) => {
	// params === InterceptorParams
	return request;
});

duploTo.setResponseInterceptor((response, request, params) => {
	// params === InterceptorParams
	return response;
});

duploTo.setDefaultHeaders({
	get token(){
		return "my super tokent"
	}
});

duploTo.addHookInfo(
	"user.connect",
	() => {
		// action
	}
)
```

## instance Requestor
Pour obtenir une instance de `Requestor`, il suffit 
```ts

```
#### Propriété de l'instance
propriétés|valeur|definition
---|---|---
s|`s(cb: (data: unknown) => void): this;`|
sd|`sd(): Promise<unknown>;`|
e|`e(cb: (data: unknown) => void): this;`|
ed|`ed(): Promise<unknown>;`|
info|`info(info: string, cb: (data: unknown) => void): this;`|
id|`id(info: string): Promise<unknown>;`|
code|`code(code: number, cb: (data: unknown) => void): this;`|
cd|`cd(code: number): Promise<unknown>;`|
then|`then(cb: (response: ResponseObjectSuccess) => void): this;`|
catch|`catch(cb: (error: Error) => void): this;`|
finally|`finally(cb: (response: ResponseObject) => void): this`|

#### Exemple request
```ts
await duploTo.request(
	"/user/{id}",
	{
		method: "GET",
		params: {id: 2},
	}
)
.result;

await duploTo.get(
	"/users",
	{
		query: {limit: 10}
	}
)
.result;

await duploTo.patch(
	"/user/{id}/firstname",
	"Mathieu",
	{
		params: {id: 63}
	}
)
.result;

await duploTo.put(
	"/user/{id}",
	{
		firstname: "Mathieu",
		lastname: "Campani",
	},
	{
		params: {id: 30},
		headers: {token: "mon super token"}
	}
)
.result;
```

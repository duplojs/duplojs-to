import {DuploConfig, DuploInstance, ExtractObject, methods} from "@duplojs/duplojs";
import {IHaveSentThis} from "@duplojs/what-was-sent";
import {duploFindManyDesc} from "@duplojs/editor-tools";
import * as zod from "zod";
import {zodToTs, printNode, createTypeAlias} from "zod-to-ts";
import {findDescriptor} from "./findDescriptor";
import {baseDefTemplate, baseInterfaceTemplate, defRouteTemplate, givesMethodTemplate, takesMethodTemplate, topComments} from "./template";
import packageJson from "../../package.json";
import {writeFileSync} from "fs";

declare module "@duplojs/duplojs" {
	interface Plugins {
		"@duplojs/to": {version: string}
	}
}

declare module "@duplojs/what-was-sent" {
	interface IHaveSentThis {
		ignore(): this;
		_ignore?: true;
	}
}

declare module "zod" {
	interface ZodType {
		setIdentifier(identifier: string | undefined): this;
		_identifier?: string;
		ignore(): this;
		_ignore?: true;
	}
}

zod.ZodType.prototype.setIdentifier = function(identifier){
	this._identifier = identifier;
	return this;
};

zod.ZodType.prototype.ignore = function(){
	this._ignore = true;
	return this;
};

IHaveSentThis.prototype.ignore = function(){
	this._ignore = true;
	return this;
};

export class IgnoreByTypeGenerator{}

function zodToTypeInString(zodSchema: zod.ZodType, identifier: string){
	const {node} = zodToTs(zodSchema, identifier);
	const typeAlias = createTypeAlias(node, identifier);
	return printNode(typeAlias, {omitTrailingSemicolon: true});
}

export type ResponseSchema = zod.ZodObject<{
	code: zod.ZodLiteral<number>,
	ok: zod.ZodLiteral<boolean>,
	info: zod.ZodEnum<any> | zod.ZodUndefined,
	body?: zod.ZodType,
}>

export interface RoutesTypes {
	responseSchemaCollection: ResponseSchema[];
	requestParameters: ExtractObject;
	paths: string[];
	method: methods;
}

export interface TypeGeneratorParams {
	outputFile?: string;
}

export default function duploTypeGenerator(
	instance: DuploInstance<DuploConfig>, 
	{
		outputFile = "./EnrichedDuploTo.d.ts",
	}: TypeGeneratorParams = {}
){
	if(!process.argv.includes("--generate-types")){
		return;
	}

	instance.plugins["@duplojs/to"] = {version: packageJson.version};
	const routesTypesCollection: RoutesTypes[] = []; 

	instance.addHook("onDeclareRoute", (route) => {
		if(duploFindManyDesc(route, (v) => v instanceof IgnoreByTypeGenerator)){
			return;
		}
		
		const {
			iHaveSentThisCollection,
			extractCollection
		} = findDescriptor(route);

		const responseSchemaCollection = iHaveSentThisCollection.map<ResponseSchema>(v => 
			zod.object({
				code: zod.literal(v.code),
				ok: zod.literal(v.code < 300 ? true : false),
				info: v.info ? zod.enum(v.info as any) : zod.undefined(),
				body: v.zod,
			})
		);

		const requestParameters = extractCollection.reduce<ExtractObject>(
			(pv, cv) => {
				Object.entries(cv).forEach(([key, value]) => {
					if(!pv[key]){
						return;
					}
					
					if(pv[key] instanceof zod.ZodType){
						return;
					}

					if(value instanceof zod.ZodType){
						if(value instanceof zod.ZodObject){
							value = value._def.shape();
						}
						else {
							pv[key] = value;
							return;
						}
					}

					Object.entries(value as Record<string, zod.ZodType> || {}).forEach(([subKey, subValue]) => {
						if(subValue._ignore) return;
						//@ts-ignore
						pv[key][subKey] = subValue;
					});
				});

				return pv;
			},
			{
				body: {},
				headers: {},
				params: {},
				query: {},
			}
		);

		Object.entries(requestParameters).forEach(([key, value]) => {
			if(Object.keys(value || {}).length === 0){
				delete requestParameters[key];
			}
			else if(value && !(value instanceof zod.ZodType)){
				requestParameters[key] = Object.values(value).find(v => !v.isOptional())
					? zod.object(value)
					: zod.object(value).optional();
			}
		});

		routesTypesCollection.push({
			responseSchemaCollection,
			requestParameters,
			paths: route.paths,
			method: route.method
		});
	});

	instance.addHook("beforeBuildRouter", () => {
		const allMethodsDefinitions: string[] = [];
		const allTypeDefinitions: string[] = [];
		const allDefDefinitions: string[] = [];

		routesTypesCollection.forEach(({
			responseSchemaCollection,
			requestParameters,
			paths,
			method,
		}) => {
			let receiveBodyTypeName: undefined | string;
			if(requestParameters.body){
				receiveBodyTypeName = `request_body_${process.hrtime.bigint()}`;
				allTypeDefinitions.push(
					zodToTypeInString(requestParameters.body as any, receiveBodyTypeName)
				);
				delete requestParameters.body;
			}

			let parametersTypeName: undefined | string;
			if(Object.keys(requestParameters).length !== 0){
				parametersTypeName = `parameters_${process.hrtime.bigint()}`;
				allTypeDefinitions.push(
					zodToTypeInString(zod.object(requestParameters as any), parametersTypeName)
				);

				parametersTypeName = `${parametersTypeName} & BaseRequestParameters`;
			}

			const reponsesTypesNames: string[] = [];
			responseSchemaCollection.forEach(responseSchema => {
				const responseTypeName = `response_${process.hrtime.bigint()}`;
				reponsesTypesNames.push(responseTypeName);

				const shape = responseSchema._def.shape();
				let sentBodyTypeName: undefined | string;
				if(shape.body && !(shape.body instanceof zod.ZodUndefined)){
					sentBodyTypeName = shape.body._identifier || `response_body_${process.hrtime.bigint()}`;
					allTypeDefinitions.push(
						zodToTypeInString(shape.body, sentBodyTypeName)
					);
				}
				delete shape.body;

				allTypeDefinitions.push(
					`${zodToTypeInString(responseSchema, responseTypeName)} & {body: ${sentBodyTypeName || "undefined"}};`
				);
			});

			const pathType = paths.map(p => `"${p}"`).join(" | ");

			if(["POST", "PATCH", "PUT"].includes(method)){
				allMethodsDefinitions.push(
					givesMethodTemplate(
						method.toLowerCase(),
						pathType,
						receiveBodyTypeName || "unknown",
						parametersTypeName || "undefined",
						!parametersTypeName || !Object.values(requestParameters).find(v => !v.isOptional()),
						reponsesTypesNames.join("\n\t\t| ") || "ResponseDefinition"
					)
				);
			}
			else {
				allMethodsDefinitions.push(
					takesMethodTemplate(
						method.toLowerCase(),
						pathType,
						parametersTypeName || "undefined",
						!parametersTypeName || !Object.values(requestParameters).find(v => !v.isOptional()),
						reponsesTypesNames.join("\n\t\t| ") || "ResponseDefinition"
					)
				);
			}

			allDefDefinitions.push(
				defRouteTemplate(
					method,
					pathType, 
					receiveBodyTypeName || "unknown",
					parametersTypeName || "undefined",
					reponsesTypesNames.join("\n\t\t| ") || "ResponseDefinition",
				)
			);
		});

		const mergedTypes = allTypeDefinitions.map(v => `export ${v}`).join("\n\n");
		const buildedInterface = baseInterfaceTemplate(allMethodsDefinitions.join(""));
		const buildedDef = baseDefTemplate(allDefDefinitions.join(" | "));

		writeFileSync(
			outputFile, 
			`${topComments}\n${mergedTypes}\n${buildedDef}\n${buildedInterface}`,
			"utf-8"
		);
		
		if(process.argv.includes("--only-generate")){
			process.exit(0);
		}
	});
}

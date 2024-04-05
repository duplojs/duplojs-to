import {AbstractRoute, Duplose, ExtractObject, MergeAbstractRoute, Process, ProcessStep, Route} from "@duplojs/duplojs";
import {IHaveSentThis} from "@duplojs/what-was-sent";
import {duploFindManyDesc} from "@duplojs/editor-tools";

export function findDescriptor(
	duplose: Route | Process | AbstractRoute | MergeAbstractRoute,
	iHaveSentThisCollection: IHaveSentThis[] = [],
	extractCollection: ExtractObject[] = []
){
	if(duplose instanceof Duplose){
		if(
			(
				duplose instanceof Route ||
				duplose instanceof AbstractRoute
			) && 
			duplose.subAbstractRoute
		){
			findDescriptor(
				duplose.subAbstractRoute.parent, 
				iHaveSentThisCollection,
				extractCollection
			);
		}

		extractCollection.push(duplose.extracted);
	
		iHaveSentThisCollection.push(
			...(duploFindManyDesc(duplose, (v) => v instanceof IHaveSentThis && !!v._ignore === false) || [])
		);
		
		duplose.steps.forEach((step, index) => {
			if(!(step instanceof ProcessStep)){
				return;
			}

			findDescriptor(
				step.parent, 
				iHaveSentThisCollection,
				extractCollection
			);
		});

	}
	else if(duplose instanceof MergeAbstractRoute){
		duplose.subAbstractRoutes.forEach(
			sub => findDescriptor(
				sub.parent, 
				iHaveSentThisCollection,
				extractCollection
			)
		);
	}

	return {
		iHaveSentThisCollection,
		extractCollection
	};
}

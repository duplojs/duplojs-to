import {AbstractRoute, CheckerStep, CutStep, Duplose, ExtractObject, MergeAbstractRoute, Process, Route} from "@duplojs/duplojs";
import {IHaveSentThis} from "@duplojs/what-was-sent";

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
		
		duplose.steps.forEach((step, index) => {
			if(
				step instanceof CutStep || 
				step instanceof CheckerStep
			){
				const desc = duplose.descs.find((v: any) => v.index === index);
				if(!desc) return;

				iHaveSentThisCollection.push(
					...desc.descStep.filter((v) => v instanceof IHaveSentThis)
				);

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

	const desc = duplose.descs.find((v) => v.type === "handler");
	if(desc){
		iHaveSentThisCollection.push(
			...desc.descStep.filter((v) => v instanceof IHaveSentThis)
		);
	}

	return {
		iHaveSentThisCollection,
		extractCollection
	};
}

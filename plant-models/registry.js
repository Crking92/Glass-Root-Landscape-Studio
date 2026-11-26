// Shared botanical asset contract v1. No engine or DOM dependency.
import {buildGrass} from './grasses.js?v=realism03';
import {buildAutumnSage} from './autumn-sage.js?v=realism01';

export const appearanceStates=Object.freeze(['leafy','young','mature','fall','dry']);
export const detailLevels=Object.freeze(['high','medium','low']);
export const individualSeeds=Object.freeze([42,73,104,135,166]);
const base='https://github.com/Crking92/Hays-Botany-Poaceae/blob/main/site/visual-key-lab/';
export const plantModels=Object.freeze([
 Object.freeze({id:'p1',scientific:'Muhlenbergia lindheimeri',common:"Lindheimer's muhly",generator:'muhly',status:'prototype',integrated:false,primary:'https://www.wildflower.org/plants/result.php?id_plant=MULI',morphology:base+'species-c3.json',notes:'Dense basal fountain; folded blades; densely flowered narrow panicles with short ascending branches, slightly opening at maturity. Microscopic ligules and hairs omitted. Dry color illustrative.'}),
 Object.freeze({id:'p0',scientific:'Schizachyrium scoparium',common:'Little bluestem',generator:'bluestem',status:'prototype',integrated:false,primary:'https://www.wildflower.org/plants/result.php?id_plant=SCSC',morphology:base+'species-a.json',notes:'Upright tuft with fuller alternating culm leaves, varied stem angles, separate 2.5–5 cm racemes with paired spikelets and stylized silky hairs; blue-green to copper and bronze seasonal tones. No variety or cultivar claim.'}),
 Object.freeze({id:'p6',scientific:'Salvia greggii',common:'Autumn sage',generator:'autumn-sage',status:'prototype',integrated:false,primary:'https://www.wildflower.org/plants/result.php?id_plant=SAGR4',morphology:'https://w3.biosci.utexas.edu/prc/K12/pdf/Salvia%20greggii',notes:'Fuller irregular woody mound with connected interior and lower-canopy foliage; opposite decussate small rounded elliptic to obovate leaves and axillary shoots; terminal paired-flower racemes; red tubular corollas with hood and more pronounced three-lobed lower lip. Mild winter retains foliage, unlike existing palette deciduous flag; no palette change. Persistent calyces illustrative; nutlets not modeled. No cultivar or local genotype claim.'})
]);
const ids=new Map(plantModels.map(p=>[p.id,p])),names=new Map(plantModels.map(p=>[p.scientific,p]));
export function findPlantModel(key){return ids.get(key)||names.get(key)||null;}
const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
// Returns new nonindexed arrays on every call; caller owns and may dispose geometry.
// units='meters': source mesh; units='normalized': horizontal diameter 1, height 1,
// Y-up, rooted at y=0; use object scale (spreadFeet,heightFeet,spreadFeet) in Studio.
// Colors default to linear sRGB for Three.js vertex colors. Lab uses display RGB.
export function buildPlantModel(key,{seed=42,stage='mature',detail='high',units='meters',colorSpace='linear'}={}){
 const model=findPlantModel(key);if(!model)throw new RangeError('Unknown species model: '+key);
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new RangeError('seed must be uint32');
 if(!appearanceStates.includes(stage)||!detailLevels.includes(detail))throw new RangeError('Unsupported appearance or detail');
 if(!['meters','normalized'].includes(units)||!['linear','display'].includes(colorSpace))throw new RangeError('Unsupported units or color space');
 const raw=model.generator==='autumn-sage'?buildAutumnSage(seed,stage,detail):buildGrass(model.generator,seed,stage,detail),p=raw.positions,n=raw.normals,c=raw.colors;
 let width=0,height=0;for(let i=0;i<p.length;i+=3){width=Math.max(width,Math.abs(p[i])*2,Math.abs(p[i+2])*2);height=Math.max(height,p[i+1]);}
 if(units==='normalized'){
  const w=width||1,h=height||1;for(let i=0;i<p.length;i+=3){p[i]/=w;p[i+1]/=h;p[i+2]/=w;const x=n[i]*w,y=n[i+1]*h,z=n[i+2]*w,m=Math.hypot(x,y,z)||1;n[i]=x/m;n[i+1]=y/m;n[i+2]=z/m;}
 }
 if(colorSpace==='linear')for(let i=0;i<c.length;i++)c[i]=linear(Math.max(0,Math.min(1,c[i])));
 return {...raw,modelId:model.id,scientific:model.scientific,units,colorSpace,sourceBounds:{width,height},triangleCount:p.length/9};
}
// Pass the caller's pinned Three.js namespace; avoids a second engine import.
export function createPlantGeometry(THREE,key,options={}){
 const raw=buildPlantModel(key,{units:'normalized',...options,colorSpace:'linear'});
 const g=new THREE.BufferGeometry();
 for(const [attr,data] of [['position',raw.positions],['normal',raw.normals],['color',raw.colors]])g.setAttribute(attr,new THREE.BufferAttribute(data,3));
 g.computeBoundingBox();g.computeBoundingSphere();g.userData.plantModel={id:raw.modelId,scientific:raw.scientific,units:raw.units,triangleCount:raw.triangleCount};return g;
}

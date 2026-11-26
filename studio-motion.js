export function motionAllowed(p,detail,count,triangles,hardParts,hidden,reduced){return p?.animate===true&&detail!=='simple'&&count<=300&&triangles<=1200000&&hardParts<=8000&&!hidden&&!reduced;}
export function windAmount(kind){return kind==='grass'?.043:kind==='tree'?.010:kind==='shrub'?.018:kind==='succulent'?.002:.030;}
export function motionStrength(v){return Number.isFinite(v)?Math.max(0,Math.min(1,v)):.35;}
export function patchWindVertex(source){const anchor='#include <begin_vertex>';if(!source.includes(anchor))return source;return 'uniform float grWindTime; uniform float grWindStrength; uniform float grWindAmount;\n'+source.replace(anchor,anchor+`
#ifdef USE_INSTANCING
 float grHeight=clamp(position.y,0.0,1.0);
 float grPhase=dot(instanceMatrix[3].xz,vec2(.19,.13));
 float grGust=.60*sin(grWindTime*1.25+grPhase)+.40*sin(grWindTime*2.4+grPhase*1.7);
 float grAspect=length(instanceMatrix[1].xyz)/max(.1,length(instanceMatrix[0].xyz));
 float grFlex=grHeight*grHeight*grWindStrength*grWindAmount*grAspect;
 transformed.x+=grFlex*grGust;
 transformed.z+=grFlex*.48*sin(grWindTime*1.7+grPhase+.8);
#endif
`);}
export function makeWindKit(T,{mat,materials}){
 const time={value:0},strength={value:0},cache=new Map();
 function pair(kind){if(cache.has(kind))return cache.get(kind);const amount={value:windAmount(kind)};
 const attach=m=>{m.onBeforeCompile=shader=>{shader.uniforms.grWindTime=time;shader.uniforms.grWindStrength=strength;shader.uniforms.grWindAmount=amount;shader.vertexShader=patchWindVertex(shader.vertexShader);};m.customProgramCacheKey=()=> 'gr-wind-v1';return m;};
 const color=attach(mat('#ffffff',{vertexColors:true,side:T.DoubleSide})),depth=attach(new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide}));materials.add(depth);
 const p={color,depth};cache.set(kind,p);return p;
 }
 return {pair,update(t,s){time.value=t;strength.value=motionStrength(s);}};
}
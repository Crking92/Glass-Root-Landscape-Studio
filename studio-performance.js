export function navigationPolicy({mode='auto',moving=false,plants=0,triangles=0,parts=0,averageMs=0,baseRatio=1,exporting=false}={}){
 const full=Math.max(.5,Math.min(1.5,Number.isFinite(baseRatio)?baseRatio:1)),heavy=plants>=200||triangles>=450000||parts>=3000||averageMs>24;
 const reduced=!exporting&&moving&&(mode==='fast'||mode==='auto'&&heavy);
 return {reduced,ratio:reduced?Math.min(full,mode==='fast'?.7:.85):full,heavy};
}
export function lodChanged(previous,next){return !previous||previous.revision!==next.revision||previous.h!==next.h||previous.fov!==next.fov||previous.x!==next.x||previous.y!==next.y||previous.z!==next.z;}
export function cameraChanged(previous,next){return !previous||previous.some((v,k)=>Math.abs(v-next[k])>1e-7);}
export function meanFrame(previous,ms){return previous>0?previous*.82+Math.max(0,ms)*.18:Math.max(0,ms);}

export function surfaceNoise(x,y,k=0){return .5+.19*Math.sin(2*Math.PI*(3*x+2*y)+k)+.13*Math.cos(2*Math.PI*(7*x-5*y)+k*.7)+.08*Math.sin(2*Math.PI*(17*x+11*y)+k*1.3)+.06*Math.cos(2*Math.PI*(37*x-29*y)+k);}
export function surfaceSample(kind,x,y){
 const tau=2*Math.PI,n=surfaceNoise(x,y,1.8),micro=surfaceNoise(x*3,y*3,5),clamp=v=>Math.max(0,Math.min(1,v));
 if(kind==='wood'){const warp=.04*Math.sin(tau*(y*2+x))+.017*Math.sin(tau*(y*5-x*2)),grain=.5+.5*Math.sin(tau*(x*23+warp*23+.25*n)),fine=.5+.5*Math.cos(tau*(x*81+warp*33)),knot=Math.exp(-((Math.sin(Math.PI*(x-.37))/.21)**2+(Math.sin(Math.PI*(y-.58))/.11)**2)),ring=.5+.5*Math.sin(36*Math.sqrt((Math.sin(Math.PI*(x-.37))/.21)**2+(Math.sin(Math.PI*(y-.58))/.11)**2));return {tone:clamp(.79+.11*n+.07*grain-.10*knot*ring-.045*(1-fine)),height:clamp(.45+.16*grain+.09*fine-.16*knot*ring)};}
 if(kind.includes('-layered')){const sand=kind.startsWith('sandstone'),sawn=kind.endsWith('-sawn'),warp=.10*Math.sin(tau*(x*2+y))+.07*n,bands=.5+.5*Math.sin(tau*(y*(sand?15:8)+warp)),seam=Math.pow(.5+.5*Math.cos(tau*(y*(sand?7:4)+warp*.6)),18),grain=surfaceNoise(x*4,y*4,7),pore=Math.max(0,.34-grain),weather=surfaceNoise(x,y,11);return {tone:clamp(.88+.08*weather+.04*bands-(sand?.095:.065)*seam-(sawn?.025:.12)*pore),height:clamp(.46+(sawn?.035:.13)*bands-(sawn?.025:.18)*seam-(sawn?.04:.3)*pore+.06*n)};}
 if(kind==='corten'||kind==='agedbrick'||kind==='blacksteel'){const spot=surfaceNoise(x*2,y*2,4),fine=surfaceNoise(x*7,y*7,9);return {tone:clamp(kind==='blacksteel'?.88+.07*n:kind==='corten'?.72+.23*spot+.04*fine:.78+.16*spot+.06*fine),height:clamp(.48+(kind==='blacksteel'?.03:.14)*fine+.08*spot)};}
 const pits=Math.max(0,(.38-micro)*3),layer=.5+.5*Math.sin(tau*(y*9+.25*Math.sin(tau*x*2)+.16*n)),mottle=.62*n+.38*micro;
 return {tone:clamp(.72+.27*mottle+.045*layer-.11*pits),height:clamp(.38+.36*mottle+.10*layer-.24*pits)};
}
export function masonryRows(){let seed=48921;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);const rows=[];let y=0;for(const h of [81,98,73,94,76,90]){let x=0,stones=[];while(x<512){const width=Math.min(512-x,62+Math.floor(rand()*80));stones.push({x,w:width,tone:rand(),shift:rand()});x+=width;}rows.push({y,h,stones});y+=h;}return rows;}
export function hardFinish(kind,p){if(p.shape.startsWith('rock'))return 'stone';if(kind==='wall')return p.color==='#8c8272'?'plain':'stone';if(kind==='birdbath')return p.color==='#759ea3'?'plain':'stone';if(['#a77c4f','#9e754c','#b18b5c','#896342','#bd976c','#68533e','#72553b'].includes(p.color))return 'wood';return 'plain';}
export function grainAxis(scale){return scale[1]>=scale[0]&&scale[1]>=scale[2]?'y':scale[0]>=scale[2]?'x':'z';}
export function makeStructureTextures(T,{textures,renderer}){
 const cache=new Map();
 function make(kind){const n=kind==='masonry'?512:256,c=document.createElement('canvas'),h=document.createElement('canvas');c.width=c.height=h.width=h.height=n;const ctx=c.getContext('2d'),hc=h.getContext('2d');if(!ctx||!hc)return null;
 const im=ctx.createImageData(n,n),hm=hc.createImageData(n,n),rows=kind==='masonry'?masonryRows():null;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n,p=surfaceSample(kind==='masonry'?'stone':kind,u,v);let rgb,relief=p.height;
 if(rows){const row=rows.find(q=>y>=q.y&&y<q.y+q.h),shift=(rows.indexOf(row)%2)*64,xx=(x+shift)%n,stone=row.stones.find(s=>xx>=s.x&&xx<s.x+s.w);const edge=Math.min(xx-stone.x,stone.x+stone.w-1-xx,y-row.y,row.y+row.h-1-y),jitter=surfaceNoise(u,v,7)*2.6,gap=edge<2+jitter,bevel=Math.max(0,Math.min(1,(edge-2-jitter)/5)),warm=stone.tone-.5,light=p.tone*.82+.18;
 rgb=gap?[142,137,124].map(v=>v*(.94+.07*p.tone)):[222+warm*25,212+warm*25,190+warm*22].map(v=>v*light*(.89+.11*bevel));relief=gap?.13:.32+bevel*.39+p.height*.22;
 }else{const tone=p.tone;rgb=[255*tone,255*tone,255*tone];}
 const i=(y*n+x)*4;im.data[i]=rgb[0];im.data[i+1]=rgb[1];im.data[i+2]=rgb[2];im.data[i+3]=255;hm.data[i]=hm.data[i+1]=hm.data[i+2]=Math.round(relief*255);hm.data[i+3]=255;}
 ctx.putImageData(im,0,0);hc.putImageData(hm,0,0);
 const texture=(canvas,colorSpace)=>{const t=new T.CanvasTexture(canvas);t.colorSpace=colorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(t);return t;};return {map:texture(c,T.SRGBColorSpace),bumpMap:texture(h,T.NoColorSpace),bumpScale:kind.endsWith('-sawn')?.018:kind.includes('-layered')?.065:kind==='blacksteel'?.006:kind==='corten'?.014:kind==='agedbrick'?.025:kind==='masonry'?.065:kind==='wood'?.025:.08};}
 return kind=>{if(!cache.has(kind))cache.set(kind,make(kind));return cache.get(kind);};
}
// UV grain direction follows the longest axis of each structural wood part.
export function woodGeometry(T,axis){const g=new T.BoxGeometry(1,1,1),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const coords={x:p.getX(i),y:p.getY(i),z:p.getZ(i)},normal={x:n.getX(i),y:n.getY(i),z:n.getZ(i)},face=Object.keys(normal).find(k=>Math.abs(normal[k])>.5),across=Object.keys(coords).find(k=>k!==axis&&k!==face)||'x';const along=face===axis?Object.keys(coords).find(k=>k!==face&&k!==across):axis;uv.setXY(i,coords[across]+.5,coords[along]+.5);}return g;}

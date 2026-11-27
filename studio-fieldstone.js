/* Deterministic fitted irregular polygons in local feet. Shared by plan and Three.js. */
(function(g){
'use strict';
const kinds=['fieldstone','fieldstoneborder','fieldstonewall','flagstonepaving'];
const palettes={limestone:['#c5bca3','#d2c9b2','#b6ae98','#d9d0b9','#bcb39e','#a9a28e'],sandstone:['#b59573','#c9a982','#a98767','#d4b893','#bca184','#b08b68']};
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function rng(s){let n=hash(s);return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function style(o){const a=o.stone||{},num=(v,d,l,h)=>Number.isFinite(v)?Math.max(l,Math.min(h,v)):d;return {material:a.material==='sandstone'?'sandstone':'limestone',piece:num(a.piece,o.kind==='flagstonepaving'?1.7:1.3,.25,8),course:num(a.course,.55,.15,2),gap:num(a.gap,.035,0,.3)};}
function clip(poly,nx,ny,k){const out=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],da=a[0]*nx+a[1]*ny-k,db=b[0]*nx+b[1]*ny-k;if(da<=1e-8)out.push(a);if((da>1e-8)!==(db>1e-8)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
function cells(w,h,sx,sy,id,gap=0,material='limestone',limit=360){if(![w,h,sx,sy].every(v=>Number.isFinite(v)&&v>0))return [];let nx=Math.min(150,Math.max(1,Math.ceil(w/sx))),ny=Math.min(80,Math.max(1,Math.ceil(h/sy)));while(nx*ny>limit){if(nx>=ny&&nx>1)nx--;else if(ny>1)ny--;else break;}const rand=rng(id),dx=w/nx,dy=h/ny,seeds=[],out=[],colors=palettes[material]||palettes.limestone;
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)seeds.push({x,y,p:[-w/2+(x+.5+(rand()-.5)*.72)*dx,-h/2+(y+.5+(rand()-.5)*.72)*dy]});
 for(const a of seeds){let poly=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];for(let y=Math.max(0,a.y-2);y<=Math.min(ny-1,a.y+2);y++)for(let x=Math.max(0,a.x-2);x<=Math.min(nx-1,a.x+2);x++){const b=seeds[y*nx+x];if(b===a)continue;const X=(b.p[0]-a.p[0])/(dx*dx),Y=(b.p[1]-a.p[1])/(dy*dy);poly=clip(poly,X,Y,((b.p[0]+a.p[0])*X+(b.p[1]+a.p[1])*Y)/2);}
  if(poly.length<3)continue;const center=poly.reduce((v,p)=>[v[0]+p[0]/poly.length,v[1]+p[1]/poly.length],[0,0]),shrink=Math.max(.55,1-gap/Math.max(.05,Math.min(dx,dy)));poly=poly.map(p=>[center[0]+(p[0]-center[0])*shrink,center[1]+(p[1]-center[1])*shrink]);out.push({poly,color:colors[Math.floor(rand()*colors.length)],center});
 }return out;
}
function ring(id){const r=rng(id),n=7+Math.floor(r()*3),pts=Array.from({length:n},(_,j)=>{const a=(j+(r()-.5)*.32)*Math.PI*2/n,rad=.76+r()*.24;return [Math.cos(a)*rad,Math.sin(a)*rad];}),min=[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1]))],max=[Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];return pts.map(p=>p.map((x,j)=>(x-min[j])/(max[j]-min[j])-.5));}
function plan(o){const a=style(o);return o.kind==='fieldstone'?[{poly:ring(o.id).map(([x,y])=>[x*o.w,y*o.h]),color:palettes[a.material][hash(o.id)%6]}]:cells(o.w,o.h,a.piece,o.kind==='flagstonepaving'?a.piece:o.h,o.id+'-plan',a.gap,a.material);}
function face(o){const a=style(o);return cells(o.w,o.height,a.piece,o.kind==='fieldstoneborder'?o.height:a.course,o.id+'-face',a.gap,a.material);}
function draw(ctx,o,project){for(const {poly,color} of plan(o)){ctx.beginPath();poly.forEach((v,j)=>{const p=project(v[0],v[1]);j?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#786f5e';ctx.lineWidth=.65;ctx.stroke();}}
g.StudioFieldstone={kinds,palettes,style,cells,ring,plan,face,draw};
})(globalThis);

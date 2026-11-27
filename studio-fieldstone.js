/* Deterministic fitted irregular polygons in local feet. Shared by plan and Three.js. */
(function(g){
'use strict';
const kinds=['buriedslab','rockoutcrop','fieldstone','fieldstoneborder','fieldstonewall','flagstonepaving'];
const palettes={limestone:['#c5bca3','#d2c9b2','#b6ae98','#d9d0b9','#bcb39e','#a9a28e'],sandstone:['#b59573','#c9a982','#a98767','#d4b893','#bca184','#b08b68']};
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function rng(s){let n=hash(s);return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function style(o){const a=o.stone||{},num=(v,d,l,h)=>Number.isFinite(v)?Math.max(l,Math.min(h,v)):d;return {material:a.material==='sandstone'?'sandstone':'limestone',piece:num(a.piece,o.kind==='flagstonepaving'?1.7:1.3,.25,8),course:num(a.course,.55,.15,2),gap:num(a.gap,.035,0,.3),burial:num(a.burial,35,0,75),fragments:Math.round(num(a.fragments,5,2,10))};}
function clip(poly,nx,ny,k){const out=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],da=a[0]*nx+a[1]*ny-k,db=b[0]*nx+b[1]*ny-k;if(da<=1e-8)out.push(a);if((da>1e-8)!==(db>1e-8)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
function cells(w,h,sx,sy,id,gap=0,material='limestone',limit=360){if(![w,h,sx,sy].every(v=>Number.isFinite(v)&&v>0))return [];let nx=Math.min(150,Math.max(1,Math.ceil(w/sx))),ny=Math.min(80,Math.max(1,Math.ceil(h/sy)));while(nx*ny>limit){if(nx>=ny&&nx>1)nx--;else if(ny>1)ny--;else break;}const rand=rng(id),dx=w/nx,dy=h/ny,seeds=[],out=[],colors=palettes[material]||palettes.limestone;
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)seeds.push({x,y,p:[-w/2+(x+.5+(rand()-.5)*.72)*dx,-h/2+(y+.5+(rand()-.5)*.72)*dy]});
 for(const a of seeds){let poly=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];for(let y=Math.max(0,a.y-2);y<=Math.min(ny-1,a.y+2);y++)for(let x=Math.max(0,a.x-2);x<=Math.min(nx-1,a.x+2);x++){const b=seeds[y*nx+x];if(b===a)continue;const X=(b.p[0]-a.p[0])/(dx*dx),Y=(b.p[1]-a.p[1])/(dy*dy);poly=clip(poly,X,Y,((b.p[0]+a.p[0])*X+(b.p[1]+a.p[1])*Y)/2);}
  if(poly.length<3)continue;const center=poly.reduce((v,p)=>[v[0]+p[0]/poly.length,v[1]+p[1]/poly.length],[0,0]),shrink=Math.max(.55,1-gap/Math.max(.05,Math.min(dx,dy)));poly=poly.map(p=>[center[0]+(p[0]-center[0])*shrink,center[1]+(p[1]-center[1])*shrink]);out.push({poly,color:colors[Math.floor(rand()*colors.length)],center});
 }return out;
}
// Broad, chipped slab outlines with long split faces and small angular chips.
function ring(id){const r=rng(id),n=10+Math.floor(r()*5),pts=Array.from({length:n},(_,j)=>{const a=(j+(r()-.5)*.28)*Math.PI*2/n,rad=.72+r()*.28;return [Math.cos(a)*rad,Math.sin(a)*rad];}),min=[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1]))],max=[Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];return pts.map(p=>p.map((x,j)=>(x-min[j])/(max[j]-min[j])-.5));}
function slabPoly(id,x,y,l,w,angle){const co=Math.cos(angle),si=Math.sin(angle);return ring(id).map(([u,v])=>[x+u*l*co-v*w*si,y+u*l*si+v*w*co]);}
// Courses consist of individually shaped, staggered slabs rather than a tiled vertical face.
function slabs(o){const a=style(o),r=rng(o.id+'-slabs'),rows=o.kind==='fieldstonewall'?Math.min(12,Math.max(1,Math.round(o.height/a.course))):1,n=Math.min(Math.max(1,Math.floor(360/rows)),Math.max(1,Math.round(o.w/a.piece))),out=[],rise=o.height/rows;
 for(let j=0;j<rows;j++){const weights=Array.from({length:n},()=>.62+r()*.78),sum=weights.reduce((s,v)=>s+v,0);let x=-o.w/2;for(let k=0;k<n;k++){const l=o.w*weights[k]/sum,center=x+l/2; x+=l;const wide=o.h*(.79+r()*.42),t=rise*(.80+r()*.26),offset=(r()-.5)*o.h*.27,turn=(r()-.5)*.36;out.push({poly:slabPoly(o.id+'-'+j+'-'+k,center,offset,Math.max(l*.62,l*1.04-a.gap),wide,turn),color:palettes[a.material][Math.floor(r()*palettes[a.material].length)],thickness:t,offset:j*rise+t/2-o.height/2,relief:true,row:j});}}
 return out;
}
// In-situ looking rock: horizontal bedding, a broad exposed base and offset fractured ledges.
function outcrop(o){const a=style(o),r=rng(o.id+'-outcrop'),colors=palettes[a.material],b=a.burial/100,H=o.height,out=[];
 const add=(key,x,y,w,d,angle,bottom,top)=>{const thickness=top-bottom;if(thickness<=0)return;out.push({poly:slabPoly(o.id+'-'+key,x*o.w,y*o.h,w*o.w,d*o.h,angle),color:colors[Math.floor(r()*colors.length)],thickness,offset:(top+bottom)/2-H/2,relief:true});};
 if(o.kind==='buriedslab'){add('slab',0,0,1,.99,0,-b*H,(1-b)*H);return out;}
 // Base follows terrain and extends below grade; remaining ledges step upward from it.
 const top=H*(1-b),baseTop=top*.40;add('base',-.025,.015,.76,.74,(r()-.5)*.18,-b*H,baseTop);
 for(let j=0;j<a.fragments-2;j++){const angle=2*Math.PI*j/Math.max(1,a.fragments-2)+(r()-.5)*.7,rad=.31+r()*.06,x=Math.cos(angle)*rad,y=Math.sin(angle)*rad,wide=.20+r()*.14,deep=.16+r()*.17;add('fragment-'+j,x,y,wide,deep,(r()-.5)*.55,-H*.10,top*(.14+r()*.26));}
 add('ledge',-.055,-.04,.57,.54,(r()-.5)*.25,baseTop*.84,top*.72);
 add('cap',.055,-.08,.37,.34,(r()-.5)*.38,top*.64,top);
 return out;}
function plan(o){if(o.kind==='buriedslab'||o.kind==='rockoutcrop')return outcrop(o);if(o.kind==='fieldstoneborder'||o.kind==='fieldstonewall')return slabs(o);const a=style(o);return o.kind==='fieldstone'?[{poly:ring(o.id).map(([x,y])=>[x*o.w,y*o.h]),color:palettes[a.material][hash(o.id)%6],relief:true}]:cells(o.w,o.h,a.piece,o.kind==='flagstonepaving'?a.piece:o.h,o.id+'-plan',a.gap,a.material);}
function face(o){const a=style(o);return cells(o.w,o.height,a.piece,o.kind==='fieldstoneborder'?o.height:a.course,o.id+'-face',a.gap,a.material);}
function draw(ctx,o,project){for(const {poly,color} of plan(o)){ctx.beginPath();poly.forEach((v,j)=>{const p=project(v[0],v[1]);j?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#786f5e';ctx.lineWidth=.65;ctx.stroke();}}
g.StudioFieldstone={kinds,palettes,style,cells,ring,slabPoly,slabs,outcrop,plan,face,draw};
})(globalThis);

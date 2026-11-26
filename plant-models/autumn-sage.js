// Original Salvia greggii prototype; meters, Y-up, display RGB. Sources in registry and README.
export function buildAutumnSage(seed=42,stage="mature",detail="high"){
 const high=detail==="high",med=detail==="medium",v=[],n=[],c=[],TAU=Math.PI*2;
 let state=seed>>>0;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=5){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*TAU/sides)),mul(w,r*Math.sin(i*TAU/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.89+.16*Math.sin(i*TAU/sides+.7)))}
 const wood=[.42,.32,.23],twig=[.38,.43,.23],green=[.30,.45,.19],winter=[.34,.40,.23],calyx=[.37,.21,.23];
 const winterStage=stage==="dry",leafy=stage==="leafy",early=stage==="young",bloom=stage==="mature"||stage==="fall"||early;
 function leaf(p,a,len,width,angle,col){const d=unit(rad(a,1,angle)),s=unit(cross([0,1,0],d)),up=unit(cross(d,s)),steps=high?6:med?4:3;let prev=null;
 for(let k=0;k<=steps;k++){const t=k/steps,center=add(p,add(mul(d,len*t),mul(up,len*.09*Math.sin(t*Math.PI)-len*.075*t*t))),w=width*(Math.sin(Math.PI*t)**.75)*(.83+.28*t),row=[add(center,mul(s,-w)),add(center,mul(up,w*.15)),add(center,mul(s,w))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.04));quad(prev[1],prev[2],row[2],row[1],tone(col,.87))}prev=row}}
 function pair(p,phi,id,small=false){reset(id,111);const length=r(.016,.036)*(small?.67:1),width=length*r(.19,.30),color=tone(winterStage?winter:green,r(.73,1.27));for(let j=0;j<2;j++){const a=phi+j*Math.PI+r(-.15,.15),pet=add(p,rad(a,.0035,.001));tube(p,pet,.00065,.00042,twig,3);leaf(pet,a,length*r(.84,1.14),width,r(-.28,.48),tone(color,r(.88,1.13)));}}
 // Bilateral corolla: open flaring tube, hooded upper lip, broad drooping three-lobed lower lip.
 function flower(p,a,id,open){reset(id,233);const d=unit(rad(a,1,r(.16,.35))),side=unit(cross([0,1,0],d)),up=unit(cross(d,side)),size=r(.86,1.12),red=tone([.79,.105,.15],r(.83,1.13)),pos=(x,y,z)=>add(p,mul(add(add(mul(d,x),mul(side,y)),mul(up,z)),size));
 function ring(x,w,h,centerZ=0){return Array.from({length:high?10:med?8:6},(_,i)=>{const t=i*TAU/(high?10:med?8:6);return pos(x,w*Math.cos(t),centerZ+h*Math.sin(t))})}
 function shell(a,b,col){for(let i=0;i<a.length;i++)quad(a[i],a[(i+1)%a.length],b[(i+1)%b.length],b[i],tone(col,.89+.15*Math.sin(i*TAU/a.length)))}
 const c0=ring(0,.0016,.0016),c1=ring(.010,.0026,.003);shell(c0,c1,calyx);
 if(!open){shell(ring(.008,.0018,.0019),ring(.017,.0021,.0024),red);return}
 const a0=ring(.006,.0017,.0016),a1=ring(.012,.0020,.0024),mouth=ring(.017,.0025,.0030);shell(a0,a1,tone(red,.83));shell(a1,mouth,red);
 const hood=[pos(.016,-.0025,.0015),pos(.016,.0025,.0015),pos(.022,.0026,.0047),pos(.026,0,.0025),pos(.022,-.0026,.0047)];for(let i=0;i<hood.length;i++)tri(pos(.020,0,.0046),hood[i],hood[(i+1)%hood.length],tone(red,1.08));
 const l=pos(.017,0,-.0027),edge=[pos(.019,-.003,-.003),pos(.021,-.0065,-.005),pos(.025,-.0068,-.008),pos(.027,-.0035,-.010),pos(.026,0,-.009),pos(.027,.0035,-.010),pos(.025,.0068,-.008),pos(.021,.0065,-.005),pos(.019,.003,-.003)];for(let i=0;i<edge.length-1;i++)tri(l,edge[i],edge[i+1],tone(red,i%2?.91:1.12));
 if(high)tube(pos(.022,0,.002),pos(.029,0,.004),.00022,.00012,[.83,.40,.43],3);
 }
 reset(0,17);const spread=r(.88,1.12),height=r(.86,1.12),main=high?15:med?12:8,branchCount=high?6:med?5:4,shoots=high?4:med?3:2;
 for(let i=0;i<main;i++){reset(i,31);const a=i*2.399+r(-.35,.35),base=rad(a,r(.01,.065),.006),h=r(.45,.73)*height,reach=r(.19,.39)*spread,thick=r(.0045,.009),pts=[];for(let k=0;k<=7;k++){const t=k/7;pts.push(add(base,rad(a+.15*Math.sin(t*3),reach*t**1.27,h*t)));if(k)tube(pts[k-1],pts[k],thick*(1-(k-1)/8),thick*(1-k/8),mix(wood,twig,t*.7),high?6:4)}
 for(let j=0;j<branchCount;j++){reset(i*20+j,43);const f=.32+j*.61/(branchCount-1),k=Math.min(6,Math.floor(f*7)),p=add(pts[k],mul(sub(pts[k+1],pts[k]),f*7-k)),phi=a+(j%2?1:-1)*r(.45,1.5),reach2=r(.10,.23)*(1-.38*f)*spread,up=r(.085,.19)*(1-.24*f)*height,q=add(p,rad(phi,reach2*.55,up*.39)),tip=add(p,rad(phi,reach2,up));tube(p,q,.0032,.0018,wood,high?5:4);tube(q,tip,.0018,.00095,twig,4);
 for(let k=0;k<shoots;k++){reset(i*100+j*10+k,57);const t=.26+k*.70/(shoots-1),p0=add(p,mul(sub(tip,p),t)),pa=phi+(k%2?1:-1)*r(.45,1.35),len=r(.055,.13),end=add(p0,rad(pa,len*.52,len*.85)),midp=add(p0,mul(sub(end,p0),.46));tube(p0,midp,.0014,.00085,twig,4);tube(midp,end,.00085,.00050,twig,4);
 const nodes=high?5:med?4:3;for(let z=0;z<nodes;z++){const fz=(z+.45)/nodes,node=add(p0,mul(sub(end,p0),fz)),id=i*10000+j*1000+k*100+z;reset(id,71);if(!winterStage||rand()>.25){pair(node,pa+z*Math.PI/2,id);if(high&&z>0)pair(node,pa+z*Math.PI/2+.25,id+500000,true)}}
 const id=i*100+j*10+k;reset(id,93);const chance=early?.34:stage==="fall"?.78:.68;if((bloom&&rand()<chance)||(winterStage&&rand()<.25)){const flen=r(.052,.097),axis=unit(rad(pa,.20,1)),top=add(end,mul(axis,flen));tube(end,top,.00085,.00035,twig,4);const levels=high?5:med?4:3;for(let z=0;z<levels;z++){const node=add(end,mul(axis,flen*(z+.4)/levels));for(let side=0;side<2;side++){const az=pa+z*Math.PI/2+side*Math.PI,base=add(node,rad(az,.004,.002));tube(node,base,.00055,.0004,calyx,3);if(!winterStage)flower(base,az,id*20+z*2+side,z<levels-1&&(!early||z<2));else tube(base,add(base,rad(az,.009,.004)),.0021,.0011,tone(wood,.9),5)}}}
 }
 }
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

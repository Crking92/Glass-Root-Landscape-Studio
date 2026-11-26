// Salvia greggii realism review 01; previous prototype blob d053074962e24fb524ab7e89d559eaef38a0143a. Meters, Y-up, display RGB. Sources in registry and README.
export function buildAutumnSage(seed=42,stage="mature",detail="high"){
 const high=detail==="high",med=detail==="medium",v=[],n=[],c=[],TAU=Math.PI*2;
 let state=seed>>>0;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=5){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*TAU/sides)),mul(w,r*Math.sin(i*TAU/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.89+.16*Math.sin(i*TAU/sides+.7)))}
 const wood=[.42,.32,.23],twig=[.38,.43,.23],green=[.35,.51,.25],winter=[.35,.43,.26],calyx=[.37,.21,.23];
 const winterStage=stage==="dry",leafy=stage==="leafy",early=stage==="young",bloom=stage==="mature"||stage==="fall"||early;
 function leaf(p,a,len,width,angle,col){const d=unit(rad(a,1,angle)),s=unit(cross([0,1,0],d)),up=unit(cross(d,s)),steps=high?4:med?3:2;let prev=null;
 for(let k=0;k<=steps;k++){const t=k/steps,center=add(p,add(mul(d,len*t),mul(up,len*.09*Math.sin(t*Math.PI)-len*.075*t*t))),w=width*(Math.sin(Math.PI*t)**.60)*(.76+.43*t),row=[add(center,mul(s,-w)),add(center,mul(up,w*.15)),add(center,mul(s,w))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.08));quad(prev[1],prev[2],row[2],row[1],tone(col,.91))}prev=row}}
 function pair(p,phi,id,small=false){reset(id,111);const length=r(.019,.038)*(small?.68:1),width=length*r(.20,.30),color=tone(mix(winterStage?winter:green,[.44,.57,.30],r(0,.42)),r(.81,1.20));for(let j=0;j<2;j++){const a=phi+j*Math.PI+r(-.15,.15),pet=add(p,rad(a,.0035,.001));tube(p,pet,.00065,.00042,twig,3);leaf(pet,a,length*r(.84,1.14),width,r(-.46,.52),tone(color,r(.88,1.13)));}}
 // Bilateral corolla: open flaring tube, hooded upper lip, broad drooping three-lobed lower lip.
 function flower(p,a,id,open){reset(id,233);const d=unit(rad(a,1,r(.16,.35))),side=unit(cross([0,1,0],d)),up=unit(cross(d,side)),size=r(.92,1.20),red=tone(mix([.79,.055,.095],[.98,.16,.18],r(0,.65)),r(.92,1.08)),pos=(x,y,z)=>add(p,mul(add(add(mul(d,x),mul(side,y)),mul(up,z)),size));
 function ring(x,w,h,centerZ=0){return Array.from({length:high?10:med?8:6},(_,i)=>{const t=i*TAU/(high?10:med?8:6);return pos(x,w*Math.cos(t),centerZ+h*Math.sin(t))})}
 function shell(a,b,col){for(let i=0;i<a.length;i++)quad(a[i],a[(i+1)%a.length],b[(i+1)%b.length],b[i],tone(col,.89+.15*Math.sin(i*TAU/a.length)))}
 const c0=ring(0,.0016,.0016),c1=ring(.010,.0026,.003);shell(c0,c1,calyx);
 if(!open){shell(ring(.008,.0018,.0019),ring(.017,.0021,.0024),red);return}
 const a0=ring(.006,.0017,.0016),a1=ring(.012,.0020,.0024),mouth=ring(.017,.0025,.0030);shell(a0,a1,tone(red,.83));shell(a1,mouth,red);
 const hood=[pos(.016,-.0025,.0015),pos(.016,.0025,.0015),pos(.022,.0026,.0047),pos(.026,0,.0025),pos(.022,-.0026,.0047)];for(let i=0;i<hood.length;i++)tri(pos(.020,0,.0046),hood[i],hood[(i+1)%hood.length],tone(red,1.08));
 const l=pos(.017,0,-.0027),edge=[pos(.019,-.003,-.003),pos(.020,-.0068,-.0045),pos(.023,-.0077,-.007),pos(.025,-.005,-.009),pos(.024,-.0035,-.008),pos(.028,-.0032,-.012),pos(.029,0,-.0127),pos(.028,.0032,-.012),pos(.024,.0035,-.008),pos(.025,.005,-.009),pos(.023,.0077,-.007),pos(.020,.0068,-.0045),pos(.019,.003,-.003)];
 const ridge=pos(.023,0,-.0065);for(let i=0;i<edge.length-1;i++)tri(ridge,edge[i],edge[i+1],tone(red,i%3===0?.92:1.08));tri(l,edge[0],ridge,tone(red,.83));tri(l,ridge,edge[edge.length-1],tone(red,.83));
 if(high)tube(pos(.022,0,.002),pos(.029,0,.004),.00022,.00012,[.83,.40,.43],3);
 }
 reset(0,17);const spread=r(.88,1.12),height=r(.86,1.12),main=high?15:med?11:8,branchCount=high?5:med?4:3,shoots=high?3:med?3:2;
 for(let i=0;i<main;i++){reset(i,31);const a=i*2.399+r(-.35,.35),base=rad(a,r(.01,.065),.006),h=r(.38,.72)*height,reach=r(.20,.40)*spread,thick=r(.0045,.009),pts=[];for(let k=0;k<=7;k++){const t=k/7;pts.push(add(base,rad(a+.20*Math.sin(t*3),reach*t**1.14,h*t)));if(k)tube(pts[k-1],pts[k],thick*(1-(k-1)/8),thick*(1-k/8),mix(wood,twig,t*.7),high?6:4)}
 for(let j=0;j<branchCount;j++){reset(i*20+j,43);const f=.20+j*.71/(branchCount-1),k=Math.min(6,Math.floor(f*7)),p=add(pts[k],mul(sub(pts[k+1],pts[k]),f*7-k)),phi=a+(j%2?1:-1)*r(.45,1.5),reach2=r(.13,.24)*(1-.48*f)*spread,up=r(.07,.17)*(1-.30*f)*height,q=add(p,rad(phi,reach2*.55,up*.39)),tip=add(p,rad(phi,reach2,up));tube(p,q,.0032,.0018,wood,high?5:4);tube(q,tip,.0018,.00095,twig,4); // Foliage at actual branch nodes, including interior and lower canopy.
 for(let l=0;l<(high?3:med?2:1);l++){const t=(l+.55)/(high?3:med?2:1),node=t<.55?add(p,mul(sub(q,p),t/.55)):add(q,mul(sub(tip,q),(t-.55)/.45)),id=800000+i*100+j*10+l;reset(id,71);if(!winterStage||rand()>.25)pair(node,phi+l*Math.PI/2,id,true);}
 for(let k=0;k<shoots;k++){reset(i*100+j*10+k,57);const t=.26+k*.70/(shoots-1),p0=t<.55?add(p,mul(sub(q,p),t/.55)):add(q,mul(sub(tip,q),(t-.55)/.45)),pa=phi+(k%2?1:-1)*r(.45,1.35),len=r(.065,.15),end=add(p0,rad(pa,len*.52,len*.85)),midp=add(p0,mul(sub(end,p0),.46));tube(p0,midp,.0014,.00085,twig,4);tube(midp,end,.00085,.00050,twig,4);
 const nodes=high?5:med?4:3;for(let z=0;z<nodes;z++){const fz=(z+.45)/nodes,node=add(p0,mul(sub(end,p0),fz)),id=i*10000+j*1000+k*100+z;reset(id,71);if(!winterStage||rand()>.25){pair(node,pa+z*Math.PI/2,id);if(high&&z>0&&z%2===0){const ax=add(node,rad(pa+z*Math.PI/2,.004,.004));tube(node,ax,.00055,.00035,twig,3);pair(ax,pa+z*Math.PI/2+.25,id+500000,true)}}}
 const id=i*100+j*10+k;reset(id,93);const chance=early?.30:stage==="fall"?.70:.61;if((bloom&&rand()<chance)||(winterStage&&rand()<.25)){const flen=r(.055,.105),axis=unit(rad(pa,r(.16,.39),1)),top=add(end,mul(axis,flen));tube(end,top,.00085,.00035,twig,4);const levels=high?5:med?4:3;for(let z=0;z<levels;z++){const node=add(end,mul(axis,flen*(z+.4)/levels));for(let side=0;side<2;side++){const az=pa+z*Math.PI/2+side*Math.PI+.12*Math.sin(id+z),base=add(node,rad(az,.004,.002));tube(node,base,.00055,.0004,calyx,3);if(!winterStage)flower(base,az,id*20+z*2+side,z<levels-1&&(!early||z<2));else tube(base,add(base,rad(az,.009,.004)),.0021,.0011,tone(wood,.9),5)}}}
 }
 }
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

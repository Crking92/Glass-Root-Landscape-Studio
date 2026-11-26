// Original Ageratina havanensis prototype. Meters, Y-up, display RGB. See registry and README for sources.
export function buildMistflower(seed=42,stage="mature",detail="high"){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],TAU=2*Math.PI;
 let state=seed>>>0;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*TAU/sides)),mul(w,r*Math.sin(i*TAU/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.90+.12*Math.cos(i*TAU/sides)))}
 function needle(a,b,w,col){const d=unit(sub(b,a)),[u,s]=frame(d);tri(add(a,mul(u,w)),add(a,mul(u,-w)),b,col);tri(add(a,mul(s,w)),add(a,mul(s,-w)),b,col)}
 const dry=stage==="dry",early=stage==="young",leafy=stage==="leafy",wood=[.46,.35,.25],twig=[.36,.46,.24],green=[.32,.49,.22],cream=[.95,.92,.87],pink=[.85,.75,.76];
 function leaf(p,phi,len,w,tilt,col){
  const d=unit(rad(phi,1,tilt)),side=unit(cross([0,1,0],d)),up=unit(cross(d,side)),steps=hi?10:md?6:4;
  const center=t=>add(p,add(mul(d,len*t),mul(up,len*(.065*Math.sin(Math.PI*t)-.14*t*t))));
  const shape=t=>Math.pow(Math.sin(Math.PI*t),.72)*(1.32-.68*t);
  let prev=null;
  for(let j=0;j<=steps;j++){const t=j/steps,mid=center(t),width=w*shape(t)*(j%2===0?1:.76),row=[add(mid,add(mul(side,-width),mul(up,-width*.10))),add(mid,mul(up,width*.10)),add(mid,add(mul(side,width),mul(up,-width*.10)))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.04));quad(prev[1],prev[2],row[2],row[1],tone(col,.87))}prev=row}
  if(hi){const vein=tone(col,1.16);needle(p,center(.84),.00048,vein);for(const k of [-1,1])needle(p,add(center(.48),mul(side,k*w*.72)),.00038,vein)}
 }
 function pair(p,phi,id,small=false){reset(id,111);const len=r(.033,.065)*(small?.72:1),width=len*r(.27,.40),col=tone(mix(green,[.43,.55,.29],r(0,.55)),r(.77,1.24));for(let k=0;k<2;k++){const a=phi+k*Math.PI+r(-.13,.13),pet=add(p,rad(a,r(.006,.013),r(-.004,.002)));tube(p,pet,.00065,.00036,twig,3);leaf(pet,a,len*r(.86,1.12),width,r(-.55,.18),tone(col,r(.91,1.1)))}}
 function head(p,phi,id,bud){
  reset(id,241);const d=unit(rad(phi,r(.03,.36),1)),[u,w]=frame(d),size=r(.85,1.15),base=add(p,mul(d,.0018)),rim=add(p,mul(d,.0045*size));tube(p,base,.0011,.0027*size,twig,5);tube(base,rim,.0027*size,.0034*size,tone(twig,.89),5);
  if(bud){tube(rim,add(rim,mul(d,.002)),.0033*size,.0018*size,tone(mix(pink,twig,.35),r(.9,1.1)),5);return}
  const count=hi?12:md?9:5;
  for(let j=0;j<count;j++){
   const a=j*2.399,radial=Math.sqrt((j+.25)/count)*.0031*size,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),root=add(rim,mul(dir,radial*.70)),end=add(root,add(mul(d,r(.0032,.0050)*size),mul(dir,.0017*size))),col=tone(mix(cream,pink,r(0,.24)),r(.93,1.05));
   const crossWidth=.00070*size;for(const x of [u,w])quad(add(root,mul(x,.00038*size)),add(root,mul(x,-.00038*size)),add(end,mul(x,-crossWidth)),add(end,mul(x,crossWidth)),col);
   if(hi){for(let k=0;k<5;k++){const a=k*TAU/5,petal=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(w,Math.cos(a)));tri(add(end,mul(side,.00035)),add(end,mul(side,-.00035)),add(end,add(mul(petal,.0011),mul(d,.0007))),col)}}
   for(const k of [-1,1]){const tip=add(end,add(mul(d,r(.0028,.0052)*size),mul(dir,k*.0018*size)));needle(end,tip,(hi?.00018:md?.00028:.00044)*size,tone(cream,r(.95,1.04)))}
  }
 }
 function cluster(p,phi,id){reset(id,173);const radius=r(.034,.069),h=r(.024,.065),count=hi?11:md?10:6,openChance=early?.32:.90;const hub=add(p,rad(phi,.008,.023));tube(p,hub,.0012,.00065,twig,4);
  for(let j=0;j<count;j++){const a=j*2.399+phi+r(-.2,.2),rr=radius*Math.sqrt((j+.35)/count)*r(.75,1.12),y=h*(1-.55*rr/radius)+r(-.009,.009),q=add(hub,rad(a,rr*.43,y*.36)),end=add(hub,rad(a,rr,y));tube(hub,q,.00065,.00045,twig,3);tube(q,end,.00045,.00025,twig,3);
   const bud=rand()>openChance;
   if(dry){tube(end,add(end,[0,.005,0]),.0019,.0011,[.51,.40,.27],4);for(let k=0;k<(hi?5:3);k++)needle(add(end,[0,.005,0]),add(end,rad(a+k*2.399,.0035,.010)),.00025,[.76,.68,.53])}
   else head(end,a,id*40+j,bud);
   reset(id*40+j,197);
  }
 }
 reset(0,17);const scale=r(.90,1.14),height=r(.88,1.14),main=hi?12:md?9:6,branches=hi?5:md?4:3,shoots=hi?3:md?2:2;
 for(let i=0;i<main;i++){
  reset(i,31);const a=i*2.399+r(-.38,.38),base=rad(a,r(.015,.08),.006),reach=r(.25,.48)*scale,h=r(.48,.88)*height,thick=r(.006,.014),pts=[];
  for(let k=0;k<=7;k++){const t=k/7;pts.push(add(base,rad(a+.22*Math.sin(t*3),reach*t**1.33,h*t)));if(k)tube(pts[k-1],pts[k],thick*(1-(k-1)/8),thick*(1-k/8),mix(wood,twig,t*.63),hi?6:4)}
  for(let j=0;j<branches;j++){
   reset(i*20+j,43);const f=.22+j*.70/(branches-1),k=Math.min(6,Math.floor(f*7)),p=add(pts[k],mul(sub(pts[k+1],pts[k]),f*7-k)),phi=a+(j%2?1:-1)*r(.40,1.4),reach2=r(.13,.30)*(1-.46*f)*scale,up=r(.12,.24)*(1-.30*f)*height,q=add(p,rad(phi,reach2*.50,up*.42)),tip=add(p,rad(phi,reach2,up));tube(p,q,.004,.0022,wood,5);tube(q,tip,.0022,.0010,twig,4);
   const on=t=>t<.5?add(p,mul(sub(q,p),t*2)):add(q,mul(sub(tip,q),(t-.5)*2));
   for(let l=0;l<(hi?3:md?2:1);l++){const id=700000+i*100+j*10+l;reset(id,71);if(!dry||rand()>.32)pair(on((l+.5)/(hi?3:md?2:1)),phi+l*Math.PI/2,id,true)}
   for(let k=0;k<shoots;k++){
    reset(i*100+j*10+k,57);const t=.24+k*.71/(shoots-1),p0=on(t),pa=phi+(k%2?1:-1)*r(.35,1.2),len=r(.09,.19),end=add(p0,rad(pa,len*.60,len*.78)),m=add(p0,mul(sub(end,p0),.46));tube(p0,m,.0018,.0011,twig,4);tube(m,end,.0011,.00065,twig,4);
    const nodes=hi?4:md?4:3;for(let z=0;z<nodes;z++){const id=i*10000+j*1000+k*100+z;reset(id,71);if(!dry||rand()>.32)pair(add(p0,mul(sub(end,p0),(z+.38)/nodes)),pa+z*Math.PI/2,id)}
    const id=i*100+j*10+k;reset(id,93);if(!leafy&&rand()<(dry?.40:early?.50:stage==="fall"?.78:.64))cluster(end,pa,id);
   }
  }
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

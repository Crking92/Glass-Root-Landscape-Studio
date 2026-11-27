// Original Phyla nodiflora prototype. Meters, Y-up, display RGB. See registry and README for citations.
export function buildFrogfruit(seed=42,stage="mature",detail="high"){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],TAU=2*Math.PI;
 let state=seed>>>0;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0])),w=cross(d,u),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*TAU/sides)),mul(w,r*Math.sin(i*TAU/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.93+.09*Math.cos(i*TAU/sides)))}
 const winter=stage==="dry",leafy=stage==="leafy",early=stage==="young",fall=stage==="fall",green=[.32,.49,.22],twig=[.36,.40,.22],purple=[.48,.28,.43];
 function blade(p,phi,id){reset(id,31);const len=r(.022,.045),wid=len*r(.25,.37),d=rad(phi,1),side=rad(phi+Math.PI/2,1),tilt=r(.002,.014),col=tone(mix(green,winter?[.48,.37,.28]:[.45,.57,.31],winter?r(.35,.85):r(0,.42)),r(.83,1.13)),steps=hi?10:md?6:4;let prev;
 for(let j=0;j<=steps;j++){const t=j/steps,half=wid*Math.pow(Math.sin(Math.PI*t),.72)*(.55+.78*t)*(t>.5&&j%2===1?.79:1),mid=add(p,add(mul(d,len*t),[0,tilt*Math.sin(t*Math.PI*.72),0])),row=[add(mid,mul(side,-half)),add(mid,[0,half*.15,0]),add(mid,mul(side,half))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.04));quad(prev[1],prev[2],row[2],row[1],tone(col,.91))}prev=row}
 }
 function head(p,phi,id,dry){reset(id,73);const len=r(.006,.015),radius=r(.0025,.004),levels=hi?5:md?4:3,top=add(p,[0,len,0]),col=dry?[.43,.32,.24]:purple;
 tube(p,add(p,[0,len*.23,0]),radius*.45,radius,col,6);tube(add(p,[0,len*.23,0]),add(p,[0,len*.77,0]),radius,radius*.88,col,6);tube(add(p,[0,len*.77,0]),top,radius*.88,.00035,col,6);
 // Overlapping purple bracts on the developing spike; a ring of open corollas below.
 for(let k=0;k<levels;k++){const t=(k+.35)/levels;for(let j=0;j<5;j++){const a=phi+j*TAU/5+k*.62,base=add(p,rad(a,radius*.83,len*t)),tip=add(base,rad(a,.0009,.0022)),side=rad(a+Math.PI/2,.0011);tri(add(base,side),sub(base,side),tip,tone(col,.88+.14*(j%3)));}}
 if(dry)return;
 const count=hi?10:md?8:5,level=r(.22,.48);for(let j=0;j<count;j++){const a=phi+j*TAU/count,axis=unit(rad(a,1,.19)),side=rad(a+Math.PI/2,1),up=unit(cross(side,axis)),base=add(p,rad(a,radius*.94,len*(level+(j%2)*.16))),mouth=add(base,mul(axis,.0028)),sz=(hi?1:md?1.22:1.55)*r(.85,1.15);tube(base,mouth,.00065,.0010*sz,[.92,.81,.84],4);const throat=add(mouth,mul(axis,.0002));for(let k=0;k<4;k++){const ang=k*TAU/4+.35,dir=add(mul(side,Math.cos(ang)),mul(up,Math.sin(ang))),tangent=add(mul(side,-Math.sin(ang)),mul(up,Math.cos(ang))),tip=add(throat,add(mul(dir,.00185*sz),mul(axis,.00035))),left=add(mouth,add(mul(dir,.00115*sz),mul(tangent,.0009*sz))),right=add(mouth,add(mul(dir,.00115*sz),mul(tangent,-.0009*sz))),petal=[.97,.94,.93];tri(throat,left,tip,petal);tri(throat,tip,right,[.93,.87,.92])}tri(add(throat,mul(side,.0005)),add(throat,mul(up,.0005)),sub(throat,mul(side,.0005)),[.92,.78,.37]);}
 }
 function node(p,phi,id,flowerChance){reset(id,97);const keep=!(winter&&rand()<.25),angle=phi+Math.PI/2+r(-.38,.38);if(keep){for(let k=0;k<2;k++)blade(p,angle+k*Math.PI,id*2+k)}reset(id,101);if(!leafy&&rand()<flowerChance){const a=angle+(id%2?Math.PI:0),height=r(.033,.082),mid=add(p,rad(a,.007,height*.55)),end=add(p,rad(a,.013,height));tube(p,mid,.0011,.0008,twig,4);tube(mid,end,.0008,.0006,twig,4);head(end,a,id,winter);}}
 reset(0,17);const radius=r(.30,.39),runners=hi?15:md?11:8,steps=hi?10:md?8:6,flowerChance=winter?.17:early?.18:fall?.40:.56;
 for(let i=0;i<runners;i++){reset(i,41);const angle=i*TAU/runners+r(-.15,.15),reach=radius*r(.73,1.04),bend=r(-.33,.33),at=t=>rad(angle+bend*Math.sin(t*2.8),reach*t,.007+.012*Math.sin(t*Math.PI)**2+.006*t);let prev=at(0);
 for(let j=1;j<=steps;j++){const p=at(j/steps),id=i*1000+j*20; tube(prev,p,.0018,.0012,twig,4);node(p,angle+bend,id,flowerChance);if(j%2===0){reset(id,131);const branchAngle=angle+(j%4===0?-1:1)*r(.85,1.55),length=r(.055,.10)*(1-.30*j/steps),count=hi?4:md?3:2;let q=p;for(let k=1;k<=count;k++){const t=k/count,end=add(p,rad(branchAngle+.18*t,length*t,.010*Math.sin(t*2)));tube(q,end,.0013,.0009,twig,3);node(end,branchAngle,id+k,flowerChance*.82);q=end;}}
 prev=p;
 }}
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

// Original species-specific botanical mesh. Meters, Y-up, display RGB.
function build(seed=42,stage="mature",detail="high",sage=true){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],T=2*Math.PI;let state=seed>>>0;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*T/sides)),mul(w,r*Math.sin(i*T/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.90+.12*Math.cos(i*T/sides)))}
 const winter=stage==="dry",leafy=stage==="leafy",early=stage==="young",fall=stage==="fall",green=sage?[.43,.56,.37]:[.30,.49,.21],twig=sage?[.48,.54,.37]:[.42,.46,.25],bark=[.53,.48,.39];
 function blade(p,phi,id){reset(id,31);const len=sage?r(.045,.085):r(.034,.061),wid=len*(sage?r(.12,.23):r(.32,.44)),d=unit(rad(phi,1,r(-.38,.36))),side=rad(phi+Math.PI/2,1),up=unit(cross(d,side)),col=tone(mix(green,[.58,.65,.40],r(0,.22)),r(.80,1.15)),steps=hi?12:md?8:5;let prev;
 for(let j=0;j<=steps;j++){const t=j/steps,half=wid*Math.pow(Math.sin(Math.PI*t),sage?.85:.62)*(sage?1:.92+.16*(1-t))*(j%2&&t>.12&&t<.90?(sage?.93:.78):1),mid=add(p,add(mul(d,len*t),mul(up,len*.12*Math.sin(Math.PI*t)))),row=[add(mid,mul(side,-half)),add(mid,mul(up,half*.20)),add(mid,mul(side,half))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.04));quad(prev[1],prev[2],row[2],row[1],tone(col,.90))}prev=row}
 if(hi&&!sage){for(let j=1;j<=4;j++)for(const sign of [-1,1]){const q=add(p,mul(d,len*j/6)),end=add(q,add(mul(d,len*.16),mul(side,sign*wid*.72*Math.sin(Math.PI*j/6))));tube(q,end,.00025,.0001,tone(col,1.23),3)}}
 }
 function sageFlower(p,a,id,bud){reset(id,71);const axis=unit(rad(a,1,.24)),[u,w]=frame(axis),len=r(.016,.019),scale=hi?1:md?1.13:1.28,cal=[.68,.70,.76],blue=tone(mix([.28,.36,.72],[.47,.43,.81],r(0,.65)),r(.88,1.12)),base=add(p,mul(axis,.004)),mouth=add(p,mul(axis,len));tube(p,base,.0016,.0025,cal,5);tube(base,mouth,.0017,.0028*scale,blue,5);if(bud)return;
 const top=add(mouth,add(mul(w,-.0042*scale),mul(axis,.003)));tri(add(mouth,mul(u,-.0028)),top,add(mouth,mul(u,.0028)),blue);
 for(let j=-1;j<=1;j++){const q=add(mouth,mul(u,j*.0024*scale)),tip=add(q,add(mul(axis,.0045*scale),mul(w,.0065*scale)));tri(q,add(tip,mul(u,.0022*scale)),tip,tone(blue,1.10));tri(q,tip,sub(tip,mul(u,.0022*scale)),tone(blue,.98));}
 }
 function sageSpike(base,a,id,len){reset(id,61);const levels=hi?14:md?10:7,whorls=hi?6:md?5:4,axis=unit(rad(a,.16,r(.80,1.1))),end=add(base,mul(axis,len));tube(base,end,.0015,.00055,winter?[.49,.42,.32]:[.57,.60,.66],4);for(let k=0;k<levels;k++){const t=(k+.45)/levels,q=add(base,mul(axis,len*t)),rr=.004*(1-.45*t);for(let j=0;j<whorls;j++){const phi=j*T/whorls+k*.33+a,site=add(q,rad(phi,rr));if(winter){tube(q,add(site,[0,.003,0]),.0017,.0011,[.47,.40,.31],4);}else{const bud=early&&t>.28||t>.91; sageFlower(site,phi,id*100+k*10+j,bud);}}}}
 function lantanaFloret(p,a,id,col,bud){reset(id,71);const axis=unit(rad(a,.22,r(.82,1.12))),[u,w]=frame(axis),len=r(.007,.010),sz=hi?1:md?1.2:1.45,mouth=add(p,mul(axis,len));tube(p,mouth,.00065,.0017*sz,col,4);if(bud)return;for(let j=0;j<4;j++){const angle=j*T/4,dir=add(mul(u,Math.cos(angle)),mul(w,Math.sin(angle))),side=add(mul(u,-Math.sin(angle)),mul(w,Math.cos(angle))),mid=add(mouth,mul(dir,.0032*sz)),tip=add(mouth,mul(dir,.0045*sz));tri(mouth,add(mid,mul(side,.0018*sz)),tip,col);tri(mouth,tip,sub(mid,mul(side,.0018*sz)),tone(col,1.07))}}
 function head(p,a,id){reset(id,61);const h=r(.035,.072),q=add(p,rad(a,.023,h));tube(p,q,.0013,.0008,twig,4);const rings=hi?3:md?2:2;for(let k=0;k<rings;k++){const count=k===0?1:k*(hi?7:md?6:4),radius=k/(rings-1)*.015;for(let j=0;j<count;j++){const phi=j*T/count+k*.55,site=add(q,rad(phi,radius,.004*(1-k/(rings-1)))),col=k===0?[.98,.81,.19]:k===rings-1?mix([.98,.41,.06],[.81,.12,.12],r(.18,.85)):[.99,.60,.09];if(fall&&id%4===0){const d=add(site,[0,.005,0]);tube(site,d,.0028,.0034,[.19,.16,.23],5);tube(d,add(d,[0,.003,0]),.0034,.0005,[.22,.18,.27],5);}else lantanaFloret(site,phi,id*100+k*30+j,col,early&&k===0);}}}
 reset(0,17);const scale=r(.88,1.12),stems=sage?(hi?28:md?18:12):(hi?12:md?9:6);
 for(let i=0;i<stems;i++){reset(i,43);const phi=i*2.399+r(-.24,.24),base=rad(phi,r(.015,.10),0),H=r(sage?.28:.62,sage?.57:1.12)*scale,R=r(sage?.10:.24,sage?.29:.55)*scale,at=t=>add(base,rad(phi+.12*Math.sin(t*3),R*t**1.4,H*t));let prev=at(0);for(let j=1;j<=6;j++){const p=at(j/6);tube(prev,p,(sage?.003:.012)*(1-.80*(j-1)/6),(sage?.003:.012)*(1-.80*j/6),sage?twig:j<3?bark:twig,sage?4:6);prev=p;}
 if(sage){const nodes=hi?7:md?6:5;for(let j=0;j<nodes;j++){const t=.08+.79*j/(nodes-1),p=at(t);reset(i*100+j,53);if(!winter||rand()<.18)for(let k=0;k<2;k++){const a=phi+j*Math.PI/2+k*Math.PI,q=add(p,rad(a,.009,.002));tube(p,q,.0008,.0005,twig,3);blade(q,a,i*1000+j*2+k);}if(j===nodes-2&&!leafy&&i%3===0)sageSpike(add(p,rad(phi+.6,.05,.04)),phi+.6,i*3+1000,r(.08,.14));}if(!leafy)sageSpike(at(1),phi,i,r(.12,.23));}
 else{const branches=hi?6:md?4:3,twigs=hi?4:md?3:2,nodes=hi?6:md?5:4;for(let j=0;j<branches;j++){reset(i*30+j,53);const t=.16+.80*j/(branches-1),p=at(t),a=phi+(j%2?1:-1)*r(.6,1.9),end=add(p,rad(a,r(.13,.33)*(1-.40*t),r(.06,.24)));tube(p,end,.004,.0017,twig,4);for(let k=0;k<twigs;k++){reset(i*1000+j*50+k,63);const q=mix(p,end,.30+.70*k/(twigs-1)),a2=a+(k%2?1:-1)*r(.6,1.6),L=r(.08,.19),U=r(.04,.13),point=f=>add(q,rad(a2,L*f,U*f));tube(q,point(1),.002,.0006,twig,4);for(let l=0;l<nodes;l++){const id=i*10000+j*1000+k*100+l,node=point(.18+.82*l/(nodes-1));reset(id,83);const a3=a2+l*Math.PI/2+r(-.18,.18);if(!winter||rand()<.04)for(let z=0;z<2;z++){const a4=a3+z*Math.PI,b=add(node,rad(a4,.009,.004));tube(node,b,.0008,.0004,twig,3);blade(b,a4,id*2+z);}reset(id,97);if(!winter&&!leafy&&l>=nodes-2&&rand()<(early?.38:fall?.65:.86))head(node,a3,id);}}}}
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}
export function buildSpecies(seed=42,stage='mature',detail='high'){return build(seed,stage,detail,false);}
export const metadata={
  "id": "tz-lantana-urticoides",
  "scientific": "Lantana urticoides",
  "common": "Texas lantana",
  "primary": "https://www.wildflower.org/plants/result.php?id_plant=LAUR2",
  "morphology": "https://w3.biosci.utexas.edu/prc/K12/pages/Lantana%20urticoides.html",
  "notes": "Spreading woody shrub, opposite broadly ovate coarse-toothed leaves with visible veins, long axillary peduncles carrying compact domed heads of yellow-centered orange-red four-lobed tubular flowers; dark ripe fruit in illustrative fall stage. Rough texture stylized; occasional branch prickles omitted. Native Texas species, not Lantana camara or a hybrid.",
  "sage": false,
  "triangleCounts": {
    "high": 519192,
    "medium": 61080,
    "low": 12920
  },
  "tests": 75,
  "stageLabels": {
    "fall": "Fall / flowers and fruit",
    "dry": "Winter / bare branches"
  },
  "framing": "bounds"
};

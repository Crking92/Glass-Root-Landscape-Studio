// Original species-specific botanical mesh. Meters, Y-up, display RGB.
function build(seed=42,stage="mature",detail="high",daisy=true){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],T=2*Math.PI;let state=seed>>>0;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*T/sides)),mul(w,r*Math.sin(i*T/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.90+.12*Math.cos(i*T/sides)))}
 function ball(p,rx,ry,rz,col){const rings=hi?4:3,sides=hi?7:5;const at=(a,b)=>add(p,[rx*Math.sin(a)*Math.cos(b),ry*Math.cos(a),rz*Math.sin(a)*Math.sin(b)]);for(let k=0;k<rings;k++)for(let j=0;j<sides;j++)quad(at(k*Math.PI/rings,j*T/sides),at((k+1)*Math.PI/rings,j*T/sides),at((k+1)*Math.PI/rings,(j+1)*T/sides),at(k*Math.PI/rings,(j+1)*T/sides),tone(col,.92+.10*Math.cos(j*T/sides)))}
 const winter=stage==="dry",leafy=stage==="leafy",early=stage==="young",fall=stage==="fall",green=daisy?[.40,.49,.33]:fall?[.58,.62,.28]:[.32,.49,.24],twig=daisy?[.44,.49,.31]:[.46,.48,.27],bark=[.49,.43,.34];
 function blade(p,phi,id){reset(id,31);const len=daisy?r(.022,.043):r(.075,.155),wid=len*(daisy?r(.11,.19):r(.28,.40)),d=unit(rad(phi,1,r(-.30,.36))),side=rad(phi+Math.PI/2,1),up=unit(cross(d,side)),col=tone(mix(green,[.65,.68,.43],r(0,.22)),r(.82,1.13)),steps=hi?12:md?8:5,lobed=daisy&&id%4===0;let prev;
 for(let j=0;j<=steps;j++){const t=j/steps,half=wid*Math.pow(Math.sin(Math.PI*t),daisy?.73:.68)*(1+.15*(1-2*t))*(j%2&&t>.12&&t<.90?(lobed?.55:daisy?1:.78):1),mid=add(p,add(mul(d,len*t),mul(up,len*.11*Math.sin(Math.PI*t)))),row=[add(mid,mul(side,-half)),add(mid,mul(up,half*.17)),add(mid,mul(side,half))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.04));quad(prev[1],prev[2],row[2],row[1],tone(col,.91))}prev=row}
 if(hi&&!daisy){for(let j=1;j<=4;j++)for(const sign of [-1,1]){const q=add(p,mul(d,len*j/6)),end=add(q,add(mul(d,len*.17),mul(side,sign*wid*.73*Math.sin(Math.PI*j/6))));tube(q,end,.00035,.0001,tone(col,1.18),3)}}
 }
 function daisyHead(p,phi,id){reset(id,61);const axis=unit(rad(phi,.20,r(.75,1.1))),[u,w]=frame(axis),disk=r(.0032,.0048),len=r(.008,.013),sz=hi?1:md?1.15:1.3,rayCount=8+Math.floor(rand()*5),center=add(p,mul(axis,.004));tube(p,center,.0025,disk,twig,5);
 for(let j=0;j<5;j++){const a=j*T/5,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),q=add(center,mul(dir,disk*1.1));tri(p,q,add(q,mul(axis,-.004)),[.41,.50,.25]);}
 if(winter||fall&&id%7===0){ball(center,disk,.004,disk,[.37,.28,.16]);return}
 if(early&&id%3===0){ball(center,disk*.90,.005,disk*.90,[.81,.80,.63]);return}
 for(let j=0;j<rayCount;j++){const a=j*T/rayCount+r(-.05,.05),dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(w,Math.cos(a))),base=add(center,mul(dir,disk*.9)),mid=add(base,add(mul(dir,len*.65*sz),mul(axis,.001))),end=add(base,mul(dir,len*sz)),wide=len*.31*sz,col=tone([.97,.96,.89],r(.94,1.02)),l=add(mid,mul(side,wide)),rr=sub(mid,mul(side,wide)),tl=add(end,mul(side,wide*.55)),tr=sub(end,mul(side,wide*.55)),notch=add(end,mul(dir,-.001*sz));tri(base,l,mid,col);tri(base,mid,rr,col);quad(mid,l,tl,notch,col);quad(mid,notch,tr,rr,col)}
 const count=hi?36:md?19:9;for(let j=0;j<count;j++){const a=j*2.399,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),q=add(center,mul(dir,disk*Math.sqrt((j+.5)/count))),tip=add(q,mul(axis,.0015));tube(q,tip,.00065,.00048,tone([.96,.70,.10],r(.88,1.09)),3)}
 }
 function beautyCluster(p,d,phi,id){reset(id,61);const [u,w]=frame(d),fruit=fall||winter,levels=fruit?(hi?3:md?2:2):2;
 for(let k=0;k<levels;k++){const count=fruit?(hi?10:md?8:5):(hi?8:md?6:4),radius=(fruit?.016:.013)*(1-.20*Math.abs(k-(levels-1)/2));for(let j=0;j<count;j++){const a=j*T/count+k*.53,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),q=add(p,add(mul(dir,radius),mul(d,(k-(levels-1)/2)*.009))),stem=add(p,mul(dir,.005));tube(p,stem,.0007,.0004,twig,3);tube(stem,q,.0004,.00025,twig,3);
 if(fruit){const rr=r(.0030,.0044)*(hi?1:md?1.12:1.25);ball(q,rr,rr*.97,rr,tone(mix([.56,.14,.68],[.78,.29,.83],r(0,.70)),r(.85,1.12)));}
 else {const col=early?[.82,.70,.79]:[.86,.67,.80],end=add(q,mul(dir,.0045));tube(q,end,.0008,.0013,col,4);if(!early||j%2===0){const [s,t]=frame(dir);for(let l=0;l<4;l++){const a=l*T/4,side=add(mul(s,Math.cos(a)),mul(t,Math.sin(a))),ortho=add(mul(s,-Math.sin(a)),mul(t,Math.cos(a))),tip=add(end,mul(side,.0027));tri(end,add(tip,mul(ortho,.001)),tip,col);tri(end,tip,sub(tip,mul(ortho,.001)),col);}}}
 }}
 }
 reset(0,17);const scale=r(.88,1.12),stems=daisy?(hi?24:md?16:11):(hi?12:md?9:6);
 for(let i=0;i<stems;i++){reset(i,43);const phi=i*2.399+r(-.26,.26),base=rad(phi,r(.015,daisy?.07:.11),0),H=r(daisy?.16:.75,daisy?.30:1.5)*scale,R=r(daisy?.12:.35,daisy?.33:.75)*scale,at=t=>add(base,rad(phi+.13*Math.sin(t*3),R*t**1.35,H*t*(1-(daisy?.13:.22)*t*t)));let prev=at(0);for(let j=1;j<=8;j++){const p=at(j/8);tube(prev,p,(daisy?.0025:.013)*(1-.85*(j-1)/8),(daisy?.0025:.013)*(1-.85*j/8),j<3?bark:twig,daisy?4:6);prev=p;}
 const branches=daisy?(hi?4:md?3:2):(hi?5:md?4:3),nodes=daisy?(hi?5:md?4:3):(hi?7:md?5:4);
 for(let j=0;j<branches;j++){reset(i*30+j,53);const t=.17+.79*j/(branches-1),p=at(t),a=phi+(j%2?1:-1)*r(.5,1.6),L=r(daisy?.06:.15,daisy?.15:.34),U=r(daisy?.025:.04,daisy?.13:.22),point=f=>add(p,rad(a,L*f,U*f*(1-.12*f)));tube(p,point(1),daisy?.0015:.004,daisy?.00055:.0012,twig,4);
 for(let l=0;l<nodes;l++){const id=i*1000+j*100+l,node=point(.15+.77*l/(nodes-1));reset(id,83);const a3=a+l*Math.PI/2+r(-.2,.2);if(!winter||daisy&&rand()<.23)for(let k=0;k<2;k++){const a4=a3+k*Math.PI,b=add(node,rad(a4,daisy?.0015:r(.018,.035),.002));tube(node,b,.0008,.0004,twig,3);blade(b,a4,id*2+k)}
 if(!daisy&&!leafy&&l>=1&&(!winter||id%3===0)&&rand()<(early?.38:fall?.91:winter?.5:.68))beautyCluster(node,unit(rad(a,.7,.5)),a3,id);
 }
 if(daisy&&!leafy){const p=point(1),tip=add(p,rad(a,.008,r(.022,.061)));tube(p,tip,.0012,.0006,twig,4);daisyHead(tip,a,i*100+j);}
 }
 if(daisy&&!leafy){const p=at(1),tip=add(p,rad(phi,.005,r(.021,.048)));tube(p,tip,.0011,.0006,twig,4);daisyHead(tip,phi,i*100+99);}
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}
export function buildSpecies(seed=42,stage='mature',detail='high'){return build(seed,stage,detail,true);}
export const metadata={
  "id": "tz-melampodium-leucanthum",
  "scientific": "Melampodium leucanthum",
  "common": "Blackfoot daisy",
  "primary": "https://www.wildflower.org/plants/result.php?id_plant=MELE2",
  "morphology": "https://efloras.org/florataxon.aspx?flora_id=1&taxon_id=250067172",
  "notes": "Low branching mound, opposite narrow gray-green leaves, occasional lobing, individual terminal heads with 8–12 cream-white rays and yellow disk florets. Buds, dry heads and partial winter foliage stylized; hairs and mature fruit structure simplified.",
  "daisy": true,
  "triangleCounts": {
    "high": 86322,
    "medium": 27132,
    "low": 8287
  },
  "tests": 75,
  "stageLabels": {
    "fall": "Fall flowering",
    "dry": "Winter / dry heads"
  },
  "framing": "bounds"
};

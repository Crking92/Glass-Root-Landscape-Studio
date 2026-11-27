// Original species-specific botanical model, meters Y-up, display RGB.
function mallow(seed=42,stage="mature",detail="high",turk=true){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],T=2*Math.PI;let state=seed>>>0;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*T/sides)),mul(w,r*Math.sin(i*T/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.9+.12*Math.cos(i*T/sides)))}
 const winter=stage==="dry",leafy=stage==="leafy",early=stage==="young",fall=stage==="fall",green=turk?[.30,.48,.20]:[.37,.49,.29],twig=[.40,.47,.27],bark=[.53,.46,.35];
 function blade(base,phi,id){reset(id,31);const len=turk?r(.080,.145):r(.023,.049),width=len*(turk?r(.41,.58):r(.32,.40)),axis=unit(rad(phi,1,r(-.37,.33))),side=unit(rad(phi+Math.PI/2,1)),up=unit(cross(side,axis)),col=tone(mix(green,[.53,.63,.37],r(0,.28)),r(.85,1.12)),count=hi?28:md?18:12,center=add(base,mul(axis,len*.39));let prev;
 for(let j=0;j<=count;j++){const a=j*T/count,front=Math.cos(a),lobe=turk?1+.21*Math.cos(3*a):1,teeth=1-(j%2?.09:0),x=width*Math.sin(a)*lobe*teeth*(.92+.10*front),y=len*(front>=0?.57:.35)*front*lobe*teeth;const p=add(center,add(mul(axis,y),add(mul(side,x),mul(up,-.008*Math.abs(Math.sin(a))))));if(prev)tri(center,prev,p,tone(col,1+.065*Math.cos(a)));prev=p;}
 if(hi){const root=base;for(const a of [-1,0,1]){const tip=add(center,add(mul(axis,len*(a===0?.46:.20)),mul(side,a*width*.78)));tube(add(root,mul(up,.0006)),add(tip,mul(up,.0007)),turk?.00065:.00033,.00015,tone(col,1.17),3);}}
 }
 function flower(p,axis,id,bud){reset(id,73);const [u,w]=frame(axis),col=turk?tone([.87,.12,.13],r(.88,1.10)):tone(mix([.88,.26,.52],[.97,.45,.69],r(0,.7)),r(.92,1.08)),scale=hi?1:md?1.13:1.25,calyx=turk?.010:.006,cl=add(p,mul(axis,calyx));tube(p,cl,turk?.003:.0018,turk?.005:.0035,twig,5);for(let j=0;j<(turk?9:6);j++){const a=j*T/(turk?9:6),dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),tip=add(cl,add(mul(dir,turk?.004:.006),mul(axis,turk?.006:.002)));tri(p,add(cl,mul(dir,.002)),tip,[.45,.55,.25]);}
 if(bud){tube(cl,add(cl,mul(axis,turk?.026:.012)),turk?.004:.003,.0015,col,6);return;}
 if(turk){ // Five overlapping asymmetric twisted petals, never a fully open flower.
 for(let j=0;j<5;j++){let prev;for(let k=0;k<=7;k++){const t=k/7,a=j*T/5+t*.92,radius=(.004+.007*Math.sin(t*Math.PI*.70))*scale,half=(.001+.006*Math.sin(Math.PI*t*.93))*scale,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(w,Math.cos(a))),center=add(cl,add(mul(axis,.032*t),mul(dir,radius))),row=[add(center,mul(side,-half*.75)),add(center,mul(side,half*1.22))];if(prev)quad(prev[0],prev[1],row[1],row[0],tone(col,.88+.14*t));prev=row;}}
 const end=add(cl,mul(axis,.048));tube(cl,end,.0012,.00065,[.80,.17,.24],5);for(let j=0;j<(hi?14:md?9:5);j++){const a=j*2.399,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),q=add(end,mul(axis,-.007*(j%4)/3)),tip=add(q,mul(dir,.0025));tube(q,tip,.00025,.0006,[.65,.19,.32],3);}for(let j=0;j<5;j++){const a=j*T/5; tube(end,add(end,add(mul(axis,.002),mul(add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),.0018))),.00028,.00065,[.97,.67,.70],3);}
 }else{ // Five broad open fan petals, pale throat, yellow anther column.
 for(let j=0;j<5;j++){const a=j*T/5,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(w,Math.cos(a))),len=r(.014,.017)*scale,mid=add(cl,add(mul(dir,len*.60),mul(axis,.003))),tip=add(cl,add(mul(dir,len),mul(axis,.006))),left=add(mid,mul(side,len*.44)),right=sub(mid,mul(side,len*.44)),lt=add(tip,mul(side,len*.22)),rt=sub(tip,mul(side,len*.25)),throat=add(cl,mul(dir,len*.22));tri(cl,left,throat,[.98,.79,.83]);tri(cl,throat,right,[.98,.79,.83]);quad(throat,left,lt,tip,col);quad(throat,tip,rt,right,tone(col,.94));}
 const end=add(cl,mul(axis,.008));tube(cl,end,.0010,.0008,[.96,.81,.60],5);for(let j=0;j<(hi?16:md?9:5);j++){const a=j*2.399,q=add(cl,mul(axis,.003+.004*(j%5)/4)),d=add(mul(u,Math.cos(a)),mul(w,Math.sin(a)));tube(q,add(q,mul(d,.0026)),.00035,.0009,[.97,.73,.15],3);}
 }}
 function fruit(p,id){reset(id,91);const color=turk?[.80,.21,.16]:[.49,.36,.23],size=turk?.0065:.004;for(let j=0;j<5;j++){const a=j*T/5,q=add(p,rad(a,size*.45,.002));tube(q,add(q,[0,size*.75,0]),size*.62,size*.4,color,5);}}
 reset(0,17);const scale=r(.86,1.15),trunks=hi?(turk?11:10):md?8:6,branches=hi?5:md?4:3,twigs=hi?3:md?3:2,leaves=hi?(turk?6:8):md?5:4;
 for(let i=0;i<trunks;i++){reset(i,43);const phi=i*2.399+r(-.3,.3),base=rad(phi,r(.025,.13),0),H=r(turk?.68:.43,turk?1.36:.80)*scale,R=r(turk?.23:.30,turk?.55:.62)*scale,at=t=>add(base,rad(phi+.18*Math.sin(t*3),R*t**1.55,H*t*(1-.10*t*t)));let last=at(0);for(let k=1;k<=6;k++){const p=at(k/6);tube(last,p,(turk?.009:.011)*(1-.78*(k-1)/6),(turk?.009:.011)*(1-.78*k/6),k<3?bark:twig,5);last=p;}
 for(let j=0;j<branches;j++){reset(i*20+j,53);const t=.23+j*.72/(branches-1),p=at(t),a=phi+(j%2?1:-1)*r(.55,1.8),reach=r(.12,turk?.32:.28)*(1-.34*t),up=r(.04,turk?.23:.18),end=add(p,rad(a,reach,up));tube(p,end,.0035,.0014,twig,4);
 for(let k=0;k<twigs;k++){reset(i*1000+j*50+k,61);const q=mix(p,end,.30+.70*k/(twigs-1)),a2=a+(k%2?1:-1)*r(.50,1.5),reach2=r(.08,turk?.22:.14),up2=r(.05,turk?.24:.16),point=f=>add(q,rad(a2,reach2*f,up2*f)),tip=point(1);tube(q,tip,.0018,.0006,twig,4);
 for(let l=0;l<leaves;l++){const id=i*10000+j*1000+k*100+l;reset(id,83);const f=.15+.85*l/(leaves-1),node=point(f),az=a2+l*2.399+r(-.25,.25),keep=!winter||rand()<(turk?.04:.25),petiole=turk?r(.024,.057):r(.006,.018),b=add(node,rad(az,petiole,.012));if(keep){tube(node,b,.0009,.00045,twig,3);blade(b,az,id);}
 reset(id,97);const chance=early?.17:fall?.35:turk?.39:.52;if(!leafy&&!winter&&l>=Math.floor(leaves*.35)&&rand()<chance){const p=add(node,rad(az,turk?.025:.012,.008)),axis=unit(rad(az,.75,turk?r(-.45,.75):r(.55,1.1)));tube(node,p,.0012,.0008,twig,4);if(fall&&rand()<.35)fruit(p,id);else flower(p,axis,id,early&&rand()<.65);}
 }}
 }}
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}
export function buildSpecies(seed=42,stage='mature',detail='high'){return mallow(seed,stage,detail,true);}
export const metadata={
  "id": "tz-malvaviscus-arboreus-var-drummondii",
  "scientific": "Malvaviscus arboreus var. drummondii",
  "common": "Turk's cap",
  "primary": "https://www.wildflower.org/plants/result.php?id_plant=MAARD",
  "morphology": "https://w3.biosci.utexas.edu/prc/K12/pages/Malvaviscus%20arboreus%20drummondii.html",
  "notes": "Many-stemmed leafy shrub, broad palmately three-lobed toothed alternate leaves with long petioles; solitary axillary crimson flowers with five twisted overlapping petals and projecting staminal column, red berry-like segmented fruit. Winter dieback illustrative; hairs omitted.",
  "turk": true,
  "triangleCounts": {
    "high": 111139,
    "medium": 42820,
    "low": 10231
  },
  "tests": 75,
  "stageLabels": {
    "fall": "Fall / flowers and fruit",
    "dry": "Winter / reduced foliage"
  },
  "framing": "bounds"
};

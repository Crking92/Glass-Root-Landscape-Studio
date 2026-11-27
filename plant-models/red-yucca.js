// Original Hesperaloe parviflora prototype; meters, Y-up, display RGB. Sources in registry and README.
export function buildRedYucca(seed=42,stage="mature",detail="high"){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],TAU=2*Math.PI;let state=seed>>>0;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*TAU/sides)),mul(w,r*Math.sin(i*TAU/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.92+.12*Math.cos(i*TAU/sides)))}
 const winter=stage==="dry",leafy=stage==="leafy",early=stage==="young",fruit=stage==="fall"||winter,green=[.32,.47,.39],plum=[.47,.35,.38],fiber=[.77,.74,.64],stem=fruit?[.57,.42,.29]:[.54,.34,.35];
 function blade(base,phi,id,scale){
  reset(id,23);const reach=r(.36,.83)*scale,h=r(.34,.75)*scale,droop=r(.13,.48)*scale,w=r(.007,.012)*Math.sqrt(scale),twist=r(-.38,.38),steps=hi?15:md?10:6,col=tone(mix(green,winter?plum:[.48,.56,.40],winter?r(.40,.90):r(0,.35)),r(.82,1.16)),out=rad(phi,1),side=rad(phi+Math.PI/2,1);
  function row(t){const p=add(base,add(mul(out,reach*t**1.42),[0,h*Math.sin(t*1.80)-droop*t*t*t,0])),half=w*Math.max(.015,(1-t)**.54),sway=twist*Math.sin(t*Math.PI),s=add(mul(side,Math.cos(sway)),[0,Math.sin(sway),0]),ridge=add(p,[0,-half*.52,0]);return [add(p,mul(s,-half)),ridge,add(p,mul(s,half)),add(ridge,[0,-half*.35,0])]}
  let prev=row(0);for(let j=1;j<=steps;j++){const cur=row(j/steps);for(let k=0;k<4;k++)quad(prev[k],prev[(k+1)%4],cur[(k+1)%4],cur[k],tone(col,k===0?1.12:k===1?.93:.84));prev=cur}
  const count=hi?5:md?3:1;for(let j=0;j<count;j++){const t=r(.16,.78),sgn=j%2?1:-1,start=row(t)[sgn===1?2:0],radius=r(.008,.016)*scale,turn=r(.70,.95),segments=hi?7:md?5:3;let last=start;for(let k=1;k<=segments;k++){const a=k/segments*TAU*turn,p=add(start,add(mul(side,sgn*radius*(1-Math.cos(a))),add(mul(out,radius*.50*Math.sin(a)),[0,-radius*.65*Math.sin(a)-.012*k/segments,0])));tube(last,p,hi?.00045:md?.00065:.00085,.00035,fiber,3);last=p}}
 }
 function flower(p,phi,id,bud){
  reset(id,137);const axis=unit(rad(phi,1,r(-.45,.20))),[u,w]=frame(axis),len=r(.027,.035),size=hi?1:md?1.12:1.25,red=tone(mix([.80,.25,.27],[.93,.49,.40],r(0,.75)),r(.90,1.10)),mouth=bud?.0021:.0050*size;
  function ring(t,width){return Array.from({length:6},(_,j)=>{const angle=j*TAU/6;return add(p,add(mul(axis,len*t),add(mul(u,width*Math.cos(angle)),mul(w,width*Math.sin(angle)))))})}
  const a=ring(0,.0018),b=ring(.28,.0030*size),cc=ring(.78,.0039*size),d=ring(1,mouth);
  for(let j=0;j<6;j++){const k=(j+1)%6;quad(a[j],a[k],b[k],b[j],tone(red,.85));quad(b[j],b[k],cc[k],cc[j],red);quad(cc[j],cc[k],d[k],d[j],tone(red,1.09));if(!bud){const dir=add(mul(u,Math.cos((j+.5)*TAU/6)),mul(w,Math.sin((j+.5)*TAU/6))),tip=add(p,add(mul(axis,len*1.07),mul(dir,mouth*1.25)));tri(d[j],d[k],tip,[.94,.79,.59]);}}
 }
 function capsule(p,phi,id){reset(id,149);const axis=unit(rad(phi,.7,.45)),len=r(.024,.031),col=winter?[.48,.37,.28]:[.55,.53,.34],a=add(p,mul(axis,len*.18)),b=add(p,mul(axis,len*.68)),end=add(p,mul(axis,len));tube(p,a,.003,.010,col,6);tube(a,b,.010,.0105,col,6);tube(b,end,.0105,.003,col,6)}
 reset(0,17);const scale=r(.88,1.13),rosettes=3+Math.floor(rand()*2),bases=[];
 for(let i=0;i<rosettes;i++){reset(i,31);const s=i===0?scale:scale*r(.57,.82),a=i*2.399+r(-.3,.3),base=i===0?[0,.025,0]:rad(a,r(.13,.30)*scale,.018);bases.push(base);const count=i===0?(hi?44:md?30:18):(hi?27:md?18:11);for(let j=0;j<count;j++){reset(i*100+j,41);const phi=j*2.399+r(-.22,.22),b=add(base,rad(phi,r(.005,.027),r(0,.035)));blade(b,phi,i*100+j,s*r(.72,1.12));}}
 if(!leafy){const scapes=hi?5:md?4:3;for(let i=0;i<scapes;i++){reset(i,71);const phi=i*2.399+r(-.45,.45),base=bases[i%bases.length],h=r(1.23,1.62)*scale,lean=r(.13,.43)*scale,point=t=>add(base,rad(phi,lean*t**2,h*t));let last=point(0);for(let j=1;j<=12;j++){const t=j/12,p=point(t);tube(last,p,.006*(1-.52*(j-1)/12),.006*(1-.52*t),stem,hi?6:4);last=p}
 const branches=hi?8:md?6:4;
 for(let j=0;j<branches;j++){reset(i*20+j,93);const t=.53+j*.43/(branches-1),p=point(t),a=phi+j*2.399+r(-.35,.35),len=r(.12,.24)*(1-.53*(j/branches))*scale,up=r(.08,.18)*scale,at=f=>add(p,rad(a,len*f,up*Math.sin(f*1.65)-.025*f*f));let q=at(0);for(let k=1;k<=4;k++){const z=at(k/4);tube(q,z,.0026*(1-.13*k),.0022*(1-.15*k),stem,4);q=z}const flowers=hi?9:md?6:4;for(let k=0;k<flowers;k++){reset(i*1000+j*30+k,103);const f=.13+k*.87/(flowers-1),node=at(f),az=a+(k%2?1:-1)*r(.55,1.35),end=add(node,rad(az,r(.008,.020),r(-.008,.010)));if(fruit){if(rand()<.32){tube(node,end,.0013,.0009,stem,3);capsule(end,az,i*1000+j*30+k)}}else{tube(node,end,.0013,.0009,stem,3);flower(end,az,i*1000+j*30+k,early?k>flowers*.27:k>flowers*.78);}}}
 }}
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

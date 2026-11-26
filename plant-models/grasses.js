// Realism review 01: revised from preserved grass prototype (Git blob 2d64f1ce35d1e3f76ac691e394759572a59efe35).
// Raw coordinates: meters, Y up. Raw vertex colors: display RGB (sRGB-like).
export function buildGrass(species="muhly",seed=42,stage="mature",detail="high"){
 const blue=species==="bluestem",high=detail==="high",mid=detail==="medium",v=[],n=[],c=[];
 let rng=seed>>>0;const random=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*random(),reseed=(i,salt)=>{rng=(Math.imul(seed+salt,2654435761)^Math.imul(i+1,1597334677))>>>0;random()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),tint=(col,f)=>col.map(x=>Math.min(1,x*f)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t);
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),len=Math.hypot(...q);if(len<1e-11)return;const normal=mul(q,1/len);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function tube(a,b,r1,r2,col,sides=4){const dir=unit(sub(b,a)),u=unit(cross(dir,Math.abs(dir[1])>.9?[1,0,0]:[0,1,0])),w=cross(dir,u);for(let j=0;j<sides;j++){const q=j*2*Math.PI/sides,t=(j+1)*2*Math.PI/sides,rad=k=>add(mul(u,Math.cos(k)),mul(w,Math.sin(k)));quad(add(a,mul(rad(q),r1)),add(a,mul(rad(t),r1)),add(b,mul(rad(t),r2)),add(b,mul(rad(q),r2)),col)}}
 function spindle(p,dir,len,width,col){const u=unit(cross(dir,Math.abs(dir[2])>.9?[1,0,0]:[0,0,1])),w=cross(dir,u),a=add(p,mul(dir,-len*.5)),b=add(p,mul(dir,len*.5)),ring=[add(p,mul(u,width)),add(p,mul(w,width)),add(p,mul(u,-width)),add(p,mul(w,-width))];for(let j=0;j<4;j++){tri(a,ring[j],ring[(j+1)%4],col);tri(b,ring[(j+1)%4],ring[j],col)}}
 function ribbon(base,phi,reach,height,droop,width,twist,col,segments,fold){const dir=[Math.cos(phi),0,Math.sin(phi)],side=[-dir[2],0,dir[0]];function point(t){const center=add(base,add(mul(dir,reach*t**1.6),[0,height*Math.sin(t*1.55)-droop*t*t*t,0])),half=width*Math.max(.025,(1-t)**.65),sway=Math.sin(t*2.8)*twist,edge=add(mul(side,Math.cos(sway)),[0,Math.sin(sway),0]),ridge=add(center,[0,half*fold,0]);return [add(center,mul(edge,-half)),ridge,add(center,mul(edge,half))]}
 let prev=point(0);for(let j=1;j<=segments;j++){const cur=point(j/segments),tone=1-.16*(j/segments);quad(prev[0],prev[1],cur[1],cur[0],tint(col,tone*1.08));quad(prev[1],prev[2],cur[2],cur[1],tint(col,tone*.86));prev=cur}}
 const count=blue?(high?420:mid?190:72):(high?990:mid?450:160),seg=high?12:mid?8:5,stems=blue?(high?48:mid?27:12):(high?56:mid?30:15);
 const dry=stage==="dry",fall=stage==="fall",leafy=stage==="leafy",young=stage==="young";
 reseed(0,77);const stature=r(.88,1.12),spread=r(.87,1.12);
 const green=blue?[.36,.49,.40]:[.35,.49,.38],copper=[.65,.34,.17],straw=[.65,.52,.33];
 for(let i=0;i<count;i++){reseed(i,23);const a=r(0,6.283),rad=Math.sqrt(random())*(blue?.10:.17)*spread,base=[Math.cos(a)*rad,r(.008,.09),Math.sin(a)*rad],phi=a+r(-.65,.65),reach=r(blue?.07:.18,blue?.32:.63)*spread,height=r(blue?.19:.20,blue?.60:.70)*stature,droop=r(.015,blue?.15:.38),width=r(.0011,blue?.0022:.00245)*(high?1.40:mid?1.75:2.4),twist=r(-.9,.9),t=r(0,1);let col=dry?mix(straw,green,blue?.06:t*.30):fall&&blue?mix(copper,straw,t*.42):t<.13?mix(green,straw,.68):mix(green,[.48,.58,.43],t*.65);col=tint(col,r(.81,1.23));ribbon(base,phi,reach,height,droop,width,twist,col,seg,blue?.16:.7)}
 if(!leafy)for(let i=0;i<stems;i++){reseed(i,53);const a=r(0,6.283),rad=Math.sqrt(random())*(blue?.095:.20)*spread,base=[Math.cos(a)*rad,.012,Math.sin(a)*rad],top=r(blue?.63:.84,blue?1.24:1.43)*stature,lean=r(.035,blue?.23:.29)*spread,out=[Math.cos(a),0,Math.sin(a)],stemcol=tint(dry?straw:fall&&blue?copper:green,r(.85,1.25)),point=y=>add(base,add([0,y,0],mul(out,lean*(y/top)**2)));
 let prev=point(0);for(let k=1;k<= (high?12:8);k++){const q=point(top*k/(high?12:8));tube(prev,q,blue?.0018:.0015,.0011,stemcol);prev=q}
 if(blue){
 // Connected lower culm leaves: alternate sides, unequal blade lengths; preserve narrow upright habit.
 const leafNodes=high?6:mid?5:3;
 for(let j=0;j<leafNodes;j++){reseed(i*12+j,87);const f=.13+j*.49/(leafNodes-1),p=point(top*f),phi=a+j*Math.PI+r(-.40,.40),len=r(.10,.23)*(1-.45*f),w=r(.0014,.0025)*(high?1.2:mid?1.45:2);ribbon(p,phi,len*r(.55,.95),len*r(.70,1.20),r(.025,.075),w,r(-.6,.6),tint(stemcol,r(.85,1.2)),seg,.14);}
 const branches=high?5:mid?4:3;
 for(let j=0;j<branches;j++){reseed(i*10+j,101);const f=.46+j*.47/(branches-1),p=point(top*f),phi=a+j*2.4+r(-.3,.3),dir=[Math.cos(phi),0,Math.sin(phi)],length=r(.045,.125),q=add(p,add(mul(dir,length*.47),[0,length,0]));tube(p,q,.0011,.00065,stemcol,4);ribbon(p,phi,r(.06,.15),r(.07,.17),.045,.0020,r(-.5,.5),stemcol,seg,.12);const raceme=r(.025,.050),axis=unit(add(mul(dir,.28),[0,1,0])),units=high?7:mid?5:4;
 for(let k=0;k<units;k++){const t=(k+.5)/units,center=add(q,mul(axis,raceme*t)),side=[Math.cos(phi+k*2.4),0,Math.sin(phi+k*2.4)],pair=add(center,mul(side,.003)),sc=young?[.52,.49,.31]:[.80,.79,.69];tube(center,pair,.00045,.0003,stemcol,3);spindle(center,axis,.0065,.0014,sc);spindle(pair,axis,.004,.00095,tint(sc,.83));if(!young){const hairs=high?5:mid?3:2;for(let l=0;l<hairs;l++){const ang=phi+l*2.4+k,tip=add(pair,[Math.cos(ang)*.006,.004+r(0,.006),Math.sin(ang)*.006]),haircol=tint([.92,.89,.79],r(.85,1.1));tube(pair,tip,high?.00032:.00055,.00010,haircol,3)}const tip=add(center,add(mul(side,.004),[0,r(.004,.013),0]));tube(center,tip,.00030,.00010,[.62,.51,.33],3)}}tube(q,add(q,mul(axis,raceme)),.00075,.00035,stemcol,3)}
 }else{
 const h=r(.23,.43),start=top-h,rings=high?17:mid?11:7;
 for(let j=0;j<rings;j++){reseed(i*20+j,109);const t=(j+.35)/rings,p=point(start+h*t),phi=j*2.399+i,open=young?.008:dry?.035:.037,span=open*Math.sin(Math.PI*(.12+.80*t))*r(.7,1.35),dir=[Math.cos(phi),0,Math.sin(phi)],q=add(p,add(mul(dir,span),[0,h*.20*(1-t)+.008,0]));tube(p,q,.00055,.00028,[.49,.47,.38],3);
 const units=high?5:mid?4:3;for(let k=0;k<units;k++){const f=(k+1)/units,center=add(p,mul(sub(q,p),f)),off=[Math.cos(phi+k*2)*.0035,r(.004,.010),Math.sin(phi+k*2)*.0035],tip=add(center,off),sc=tint(young?[.57,.59,.45]:dry?[.78,.69,.50]:[.84,.85,.76],r(.83,1.14));tube(center,tip,.00037,.00016,sc,3);spindle(tip,unit(add(mul(dir,.25),[0,1,0])),r(.003,.0045),high?.00075:.00125,sc)}}}
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

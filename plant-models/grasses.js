// Realism review 03: little bluestem foliage and silky racemes. Preserve muhly review 02 geometry (blob 640984b480584d3ebbb274ac9f2c37e72ea4ee76).
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
 const count=blue?(high?520:mid?240:100):(high?990:mid?450:160),seg=high?12:mid?8:5,stems=blue?(high?48:mid?27:12):(high?56:mid?30:15);
 const dry=stage==="dry",fall=stage==="fall",leafy=stage==="leafy",young=stage==="young";
 reseed(0,77);const stature=r(.88,1.12),spread=r(.87,1.12);
 const green=blue?[.34,.50,.46]:[.35,.49,.38],copper=[.65,.34,.17],straw=[.65,.52,.33];
 for(let i=0;i<count;i++){reseed(i,23);const a=r(0,6.283),rad=Math.sqrt(random())*(blue?.10:.17)*spread,base=[Math.cos(a)*rad,r(.008,.09),Math.sin(a)*rad],phi=a+r(-.65,.65),reach=r(blue?.065:.18,blue?.35:.63)*spread,height=r(blue?.24:.20,blue?.68:.70)*stature,droop=r(.015,blue?.19:.38),width=r(.0011,blue?.0022:.00245)*(blue?(high?1.65:mid?2.1:2.65):(high?1.40:mid?1.75:2.4)),twist=r(-.9,.9),t=r(0,1);let col=blue?(dry?mix([.68,.50,.32],[.47,.27,.16],t*.65):fall?(t<.12?mix(green,copper,.48):mix([.62,.26,.15],[.77,.53,.26],t)):t<.10?mix(green,straw,.60):mix([.28,.45,.44],[.49,.59,.41],t)):dry?mix(straw,green,t*.30):t<.13?mix(green,straw,.68):mix(green,[.48,.58,.43],t*.65);col=tint(col,r(.81,1.23));ribbon(base,phi,reach,height,droop,width,twist,col,seg,blue?.16:.7)}
 if(!leafy||blue)for(let i=0;i<stems;i++){reseed(i,53);const a=r(0,6.283),rad=Math.sqrt(random())*(blue?.095:.20)*spread,base=[Math.cos(a)*rad,.012,Math.sin(a)*rad],top=r(blue?.63:.84,blue?1.24:1.43)*stature*(blue&&leafy?.62:1),lean=r(.035,blue?.30:.29)*spread,out=[Math.cos(a),0,Math.sin(a)],stemcol=tint(dry?straw:fall&&blue?copper:green,r(.85,1.25)),point=y=>add(base,add([0,y,0],mul(out,lean*(y/top)**2)));
 let prev=point(0);for(let k=1;k<= (high?12:8);k++){const q=point(top*k/(high?12:8));tube(prev,q,blue?.0018:.0015,.0011,stemcol);prev=q}
 if(blue){
 // Alternating leaves along lower and middle culm, with visible sheath collars.
 // Each raceme remains short and separately terminates an upper leafy branch.
 const leafNodes=high?8:mid?6:4;
 for(let j=0;j<leafNodes;j++){
  reseed(i*12+j,87);
  const f=.10+j*.65/(leafNodes-1),p=point(top*f),phi=a+j*Math.PI+r(-.44,.44),len=r(.14,.30)*(1-.42*f),w=r(.0014,.0025)*(high?1.5:mid?1.8:2.4);
  const color=fall?tint(mix([.62,.27,.15],[.76,.48,.22],r(0,1)),r(.90,1.15)):tint(stemcol,r(.85,1.2));
  tube(point(Math.max(0,top*f-.018)),p,.0021,.0019,tint(color,.84),3);
  ribbon(p,phi,len*r(.64,1.08),len*r(.62,1.14),r(.03,.09),w,r(-.85,.85),color,seg,.14);
 }
 if(leafy)continue;
 const branches=high?5:mid?4:3;
 for(let j=0;j<branches;j++){
  reseed(i*10+j,101);
  const f=.43+j*.50/(branches-1),p=point(top*f),phi=a+j*2.4+r(-.42,.42),dir=[Math.cos(phi),0,Math.sin(phi)],length=r(.055,.13),q=add(p,add(mul(dir,length*r(.40,.68)),[0,length,0]));
  tube(p,q,.0011,.00065,stemcol,4);
  ribbon(p,phi,r(.07,.17),r(.08,.20),.055,.0022,r(-.65,.65),stemcol,seg,.12);
  const raceme=r(.025,.050),axis=unit(add(mul(dir,r(.24,.66)),[0,1,0])),units=high?7:mid?5:4;
  const end=add(q,mul(axis,raceme));tube(q,end,.00075,.00035,stemcol,3);
  for(let k=0;k<units;k++){
   const t=(k+.5)/units,center=add(q,mul(axis,raceme*t)),side=[Math.cos(phi+k*2.4),0,Math.sin(phi+k*2.4)],pair=add(center,mul(side,.003)),sc=young?[.52,.49,.31]:[.85,.82,.71];
   tube(center,pair,.00045,.0003,stemcol,3);spindle(center,axis,.0065,.0014,sc);spindle(pair,axis,.004,.00095,tint(sc,.83));
   if(!young){
    // Crossed tapered ribbons approximate the silky cilia without using six triangles per hair.
    const hairs=high?8:mid?5:3,base=add(center,mul(sub(pair,center),.64));
    for(let l=0;l<hairs;l++){
     const ang=phi+l*2.399+k,radial=[Math.cos(ang),0,Math.sin(ang)],tip=add(base,add(mul(radial,r(.004,.008)),mul(axis,r(.005,.010)))),d=unit(sub(tip,base)),u=unit(cross(d,Math.abs(d[1])>.9?[1,0,0]:[0,1,0])),w=cross(d,u),th=high?.00048:mid?.00070:.0010,cl=tint([.94,.92,.85],r(.88,1.08));
     tri(add(base,mul(u,th)),add(base,mul(u,-th)),tip,cl);tri(add(base,mul(w,th)),add(base,mul(w,-th)),tip,cl);
    }
    const tip=add(center,add(mul(side,.004),mul(axis,r(.004,.013))));tube(center,tip,.00030,.00010,[.62,.51,.33],3);
   }
  }
 }
 }else{
 // Dense contracted panicle: short ascending, flowered branches in staggered pairs.
 // Scale fine spikelet geometry for landscape readability, not a measured specimen.
 const h=r(.23,.43),start=top-h,rings=high?24:mid?16:10;
 const open=young?.0075:dry?.020:.018;
 for(let j=0;j<rings;j++){
  reseed(i*32+j,109);
  const t=(j+.30)/rings,p=point(start+h*t),envelope=Math.pow(Math.sin(Math.PI*(.12+.88*t)),.66);
  const branches=2,units=high?4:mid?3:2;
  for(let m=0;m<branches;m++){
   const phi=j*2.399+i+m*Math.PI+r(-.24,.24),dir=[Math.cos(phi),0,Math.sin(phi)],span=open*envelope*r(.82,1.18),rise=h*(young?.072:.11)*(1-.45*t)*r(.83,1.14);
   const q=add(p,add(mul(dir,span),[0,rise,0]));tube(p,q,.00048,.00019,young?[.49,.51,.36]:[.72,.66,.50],3);
   // Spikelets extend nearly to the branch base, overlap vertically and fill the interior.
   for(let k=0;k<units;k++){
    const f=(k+.38)/units,center=add(p,mul(sub(q,p),f)),side=phi+(k%2?1:-1)*1.15;
    const off=(young?.0015:.0032)*r(.7,1.25),tip=add(center,[Math.cos(side)*off,r(.001,.004),Math.sin(side)*off]);
    const col=tint(young?[.69,.68,.49]:dry?[.84,.76,.59]:[.92,.89,.77],r(.88,1.10));
    const axis=unit(add(mul(dir,young?.18:.36),[0,1,0]));
    spindle(tip,axis,r(.0045,.0075)*(high?1:mid?1.17:1.45),(young?.0009:.00135)*(high?1:mid?1.35:1.75),col);
   }
  }
 }}
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

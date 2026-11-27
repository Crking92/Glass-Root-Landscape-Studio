// Original species-specific draft; artistic proportions; no copied assets.
function shrub(seed=42,stage="mature",detail="high",cenizo=false){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],TAU=2*Math.PI;let state=seed>>>0;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*TAU/sides)),mul(w,r*Math.sin(i*TAU/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.88+.17*Math.cos(i*TAU/sides)))}
 const dry=stage==="dry",leafy=stage==="leafy",early=stage==="young",fall=stage==="fall",bark=cenizo?[.45,.41,.35]:[.57,.49,.39],twig=cenizo?[.48,.49,.39]:[.41,.45,.24],green=cenizo?[.59,.65,.57]:[.39,.54,.25];
 function blade(p,phi,id){reset(id,31);const len=cenizo?r(.018,.031):r(.028,.053),wid=len*(cenizo?r(.28,.39):r(.15,.23)),d=unit(rad(phi,1,r(-.24,.46))),[side,up]=frame(d),steps=hi?6:md?4:3,col=tone(mix(green,cenizo?[.76,.79,.71]:[.55,.65,.32],r(0,.42)),r(.87,1.12));let prev;
 for(let j=0;j<=steps;j++){const t=j/steps,half=wid*Math.pow(Math.sin(Math.PI*t),cenizo?.53:1.15)*(cenizo?.60+.75*t:1),mid=add(p,add(mul(d,len*t),mul(up,len*.10*Math.sin(Math.PI*t)))),row=[add(mid,mul(side,-half)),add(mid,mul(up,half*.19)),add(mid,mul(side,half))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.05));quad(prev[1],prev[2],row[2],row[1],tone(col,.90))}prev=row}
 }
 function flower(p,phi,id,bud){reset(id,71);const axis=unit(rad(phi,1,r(-.20,.30))),[u,w]=frame(axis),len=cenizo?r(.016,.023):r(.026,.039),sz=(hi?1:md?1.12:1.27),color=cenizo?tone(mix([.68,.33,.72],[.86,.52,.80],r(0,.75)),r(.89,1.09)):tone(mix([.88,.18,.07],[.97,.40,.09],r(0,.65)),r(.87,1.10)),N=hi?10:md?8:6,radial=(t,rr,j)=>add(p,add(mul(axis,len*t),add(mul(u,rr*Math.cos(j*TAU/N)),mul(w,rr*Math.sin(j*TAU/N))))),rings=[.0,.42,.80,1],width=cenizo?[.0018,.0032,.0065,.008]:[.0013,.0021,.0027,.0034];if(bud)width[3]*=.45;for(let k=1;k<rings.length;k++)for(let j=0;j<N;j++)quad(radial(rings[k-1],width[k-1]*sz,j),radial(rings[k-1],width[k-1]*sz,j+1),radial(rings[k],width[k]*sz,j+1),radial(rings[k],width[k]*sz,j),tone(color,.88+.12*k/3));if(bud)return;
 const mouth=add(p,mul(axis,len));const lobes=cenizo?5:4;for(let j=0;j<lobes;j++){const a=j*TAU/lobes,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(w,Math.cos(a))),reach=(cenizo?.012:.0065)*sz,half=(cenizo?.0055:.0021)*sz,base=add(mouth,mul(dir,width[3]*.75*sz)),mid=add(mouth,add(mul(dir,reach*.85),mul(axis,(cenizo?.003:.007)*sz))),tip=add(mouth,add(mul(dir,reach),mul(axis,(cenizo?.004:.011)*sz)));tri(base,add(mid,mul(side,half)),tip,tone(color,1.08));tri(base,tip,sub(mid,mul(side,half)),color);}
 if(!cenizo){for(let k of [-1,1]){const end=add(mouth,add(mul(axis,.012),mul(u,k*.0012)));tube(mouth,end,.00035,.00027,[.94,.55,.18],3);}}
 }
 reset(0,17);const scale=r(.91,1.12),trunks=cenizo?(hi?13:md?10:7):(hi?9:md?7:5),branches=cenizo?(hi?6:md?5:4):(hi?5:md?4:3),twigs=cenizo?(hi?5:md?4:3):(hi?3:md?3:2),leaves=cenizo?(hi?12:md?8:6):(hi?7:md?5:4);
 for(let i=0;i<trunks;i++){reset(i,43);const phi=i*2.399+r(-.27,.27),base=rad(phi,r(.02,.13),0),H=r(cenizo?.65:.65,cenizo?1.14:1.10)*scale,R=r(cenizo?.24:.29,cenizo?.54:.61)*scale,thick=r(.010,.021),at=t=>add(base,rad(phi+.14*Math.sin(t*3),R*t**1.3,H*t));let last=at(0);for(let k=1;k<=6;k++){const p=at(k/6);tube(last,p,thick*(1-.79*(k-1)/6),thick*(1-.79*k/6),bark,hi?7:5);last=p;}
 for(let j=0;j<branches;j++){reset(i*20+j,53);const t=.30+j*.68/(branches-1),p=at(t),a=phi+(j%2?1:-1)*r(.55,1.9),reach=r(.16,cenizo?.35:.40)*(1-.45*t)*scale,up=r(.13,.35)*(1-.38*t)*scale,mid=add(p,rad(a,reach*.48,up*.4)),end=add(p,rad(a,reach,up));tube(p,mid,.007,.004,bark,5);tube(mid,end,.004,.0018,twig,4);
 for(let k=0;k<twigs;k++){reset(i*1000+j*50+k,61);const f=.30+.70*k/(twigs-1),q=f<.5?mix(p,mid,f*2):mix(mid,end,(f-.5)*2),a2=a+(k%2?1:-1)*r(.5,1.65),reach2=r(.07,cenizo?.16:.19),up2=r(.06,.17),point=f=>add(q,rad(a2,reach2*f,up2*f)),tip=point(1);tube(q,tip,.0027,.0008,twig,4);
 for(let l=0;l<leaves;l++){const id=i*10000+j*1000+k*100+l;reset(id,83);const f=.10+.90*l/(leaves-1),node=point(f),az=a2+l*2.399+r(-.25,.25),keep=cenizo||!dry||rand()<.035;if(keep){for(let z=0;z<(cenizo?1:2);z++){const angle=az+z*Math.PI,b=add(node,rad(angle,.004,.003));tube(node,b,.0007,.0004,twig,3);blade(b,angle,id*2+z);}}
 reset(id,97);const chance=cenizo?(early?.10:fall?.38:.42):(early?.10:fall?.37:.45);if(!leafy&&!dry&&l>=Math.floor(leaves*(cenizo?.25:.48))&&rand()<chance){const angle=az+r(-.4,.4),b=add(node,rad(angle,.009,.008));tube(node,b,.0009,.0007,twig,3);flower(b,angle,id,early&&rand()<.65);}else if(!cenizo&&dry&&l===leaves-1&&rand()<.20){tube(node,add(node,rad(az,.013,.015)),.0016,.003,[.44,.32,.23],4);}
 }
 }}
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}
export function buildSpecies(seed=42,stage='mature',detail='high'){return shrub(seed,stage,detail,true);}
export const metadata={
  "id": "tz-leucophyllum-frutescens",
  "scientific": "Leucophyllum frutescens",
  "common": "Texas sage (cenizo)",
  "primary": "https://www.wildflower.org/plants/result.php?id_plant=LEFR3",
  "morphology": "https://plants.ces.ncsu.edu/plants/leucophyllum-frutescens/",
  "notes": "Dense but irregular evergreen silver-gray shrub with crowded alternate rounded, entire leaves and solitary axillary pink-lavender flared five-lobed flowers. Silvery hairs represented by matte color, not individual trichomes. Bloom flush illustrative, not calendar prediction.",
  "cenizo": true,
  "triangleCounts": {
    "high": 241296,
    "medium": 64476,
    "low": 18584
  },
  "tests": 75,
  "stageLabels": {
    "fall": "Fall flowering",
    "dry": "Winter / silver foliage"
  },
  "framing": "bounds"
};

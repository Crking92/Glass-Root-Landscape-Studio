// Dermatophyllum secundiflorum realism review 01: fuller canopy and racemes. Previous blob 2bd77a779a7f4a144242852e8815d2cbae40f36e. Meters, Y-up, display RGB. See registry and README for citations.
export function buildMountainLaurel(seed=42,stage="mature",detail="high"){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],TAU=Math.PI*2;
 let state=seed>>>0;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 const bark=[.40,.36,.31],twig=[.32,.40,.24],leafGreen=[.25,.41,.19],purple=[.57,.35,.76];
 // Continuous rings along a curved branch avoid visible gaps between tapered segments.
 function branch(points,ra,rb,col,sides=6){let previous;for(let k=0;k<points.length;k++){const t=k/(points.length-1),d=unit(sub(points[Math.min(k+1,points.length-1)],points[Math.max(k-1,0)])),[u,w]=frame(d),radius=ra*(1-t)+rb*t,ring=Array.from({length:sides},(_,j)=>add(points[k],add(mul(u,radius*Math.cos(j*TAU/sides)),mul(w,radius*Math.sin(j*TAU/sides)))));if(previous)for(let j=0;j<sides;j++)quad(previous[j],previous[(j+1)%sides],ring[(j+1)%sides],ring[j],tone(col,.88+.17*Math.cos(j*TAU/sides)));previous=ring}}
 function tube(a,b,ra,rb,col,sides=4){branch([a,b],ra,rb,col,sides)}
 function leaflet(p,d,len,w,col){const [side,up]=frame(d),steps=hi?5:md?4:3;let prev;for(let k=0;k<=steps;k++){const t=k/steps,mid=add(p,add(mul(d,len*t),[0,len*(.10*Math.sin(Math.PI*t)-.09*t*t),0])),half=w*Math.pow(Math.sin(Math.PI*t),.60)*(.78+.38*t),row=[add(mid,mul(side,-half)),add(mid,mul(up,half*.12)),add(mid,mul(side,half))];if(prev){quad(prev[0],prev[1],row[1],row[0],tone(col,1.04));quad(prev[1],prev[2],row[2],row[1],tone(col,.87))}prev=row}}
 function compound(p,phi,id){reset(id,111);const d=unit(rad(phi,1,r(-.25,.42))),side=unit(cross([0,1,0],d)),len=r(.112,.185),pairs=rand()<.65?3:4,col=tone(mix(leafGreen,[.39,.49,.25],r(0,.46)),r(.83,1.17)),rachis=tone(twig,1.07),at=t=>add(p,add(mul(d,len*t),[0,.012*Math.sin(Math.PI*t),0]));
 tube(p,at(.52),.0012,.00085,rachis,3);tube(at(.52),at(1),.00085,.00045,rachis,3);
 for(let j=0;j<pairs;j++){const t=.23+j*.57/(pairs-1),node=at(t);for(const k of [-1,1]){const axis=unit(add(mul(d,r(.35,.69)),add(mul(side,k),[0,r(-.22,.22),0]))),base=add(node,mul(axis,.004)),l=r(.035,.061)*(1-.16*t);tube(node,base,.00065,.00042,rachis,3);leaflet(base,axis,l,l*r(.26,.39),tone(col,r(.91,1.10)));}}
 leaflet(at(1),d,r(.043,.065),r(.015,.021),tone(col,1.04));
 }
 function petal(p,d,u,w,len,width,col){const a=add(p,mul(d,len*.18)),b=add(p,add(mul(d,len*.66),mul(u,width))),cc=add(p,mul(d,len)),dd=add(p,add(mul(d,len*.66),mul(u,-width))),ridge=add(p,add(mul(d,len*.57),mul(w,width*.28)));tri(a,b,ridge,col);tri(b,cc,ridge,tone(col,1.08));tri(cc,dd,ridge,tone(col,.98));tri(dd,a,ridge,col)}
 function pea(p,phi,id,bud){reset(id,191);const d=unit(rad(phi,1,r(-.35,.15))),u=unit(cross([0,1,0],d)),w=unit(cross(d,u)),size=r(.92,1.23)*(hi?1:md?1.12:1.30),col=tone(mix(purple,[.72,.52,.85],r(0,.65)),r(.84,1.13)),base=add(p,mul(d,.004));tube(p,base,.0015,.0024,[.34,.35,.25],4);
 if(bud){tube(base,add(base,mul(d,.011*size)),.0038*size,.0015*size,tone(col,.86),5);return}
 // Papilionaceous silhouette: broad banner, two wings, folded keel.
 petal(base,unit(add(d,mul(w,.9))),u,w,.020*size,.010*size,tone(col,1.12));
 for(const k of [-1,1])petal(add(base,mul(u,k*.002)),unit(add(d,mul(u,k*.42))),w,u,.019*size,.0055*size,col);
 petal(base,unit(add(d,mul(w,-.32))),u,w,.016*size,.0045*size,tone(col,.75));
 }
 function raceme(p,phi,id){reset(id,181);const length=r(.095,.17),lean=r(.035,.075),count=hi?18:md?14:9,at=t=>add(p,rad(phi,lean*t,-length*t+.012*Math.sin(Math.PI*t)));branch([at(0),at(.33),at(.66),at(1)],.0018,.00055,twig,4);for(let j=0;j<count;j++){reset(id*30+j,201);const t=(j+.3)/count,a=phi+j*2.399+r(-.24,.24),node=at(t),end=add(node,rad(a,r(.008,.016),r(-.005,.002)));tube(node,end,.00075,.00045,twig,3);pea(end,a,id*30+j,stage==="young"?j>count*.25:j>count*.85);}}
 function pod(p,phi,id){reset(id,211);const len=r(.065,.135),lobes=2+Math.floor(rand()*4),col=stage==="dry"?[.39,.32,.25]:[.58,.56,.47],at=t=>add(p,rad(phi,.025*t,-len*t));tube(p,at(.13),.0014,.001,col,4);const pts=[],radii=[];for(let j=0;j<=lobes*2;j++){const t=j/(lobes*2);pts.push(at(.13+.87*t));radii.push((j===0||j===lobes*2?.002:j%2?.009:.0048)*r(.88,1.1))}for(let j=1;j<pts.length;j++)tube(pts[j-1],pts[j],radii[j-1],radii[j],col,hi?7:5);}
 reset(0,17);const height=r(.88,1.12),spread=r(.85,1.13),trunks=3+Math.floor(rand()*3),branches=hi?7:md?5:4,twigs=hi?5:md?4:3,leaves=hi?10:md?8:5;
 for(let i=0;i<trunks;i++){
  reset(i,31);const phi=i*TAU/trunks+r(-.32,.32),base=rad(phi,r(.035,.15),0),H=r(2.65,3.55)*height,R=r(.48,1.08)*spread,thick=r(.055,.10),points=[];for(let k=0;k<=8;k++){const t=k/8;points.push(add(base,rad(phi+.25*Math.sin(t*3),R*t**1.18,H*t)));}branch(points,thick,.009,bark,hi?9:6);
  const on=t=>{const k=Math.min(7,Math.floor(t*8));return add(points[k],mul(sub(points[k+1],points[k]),t*8-k));};
  for(let j=0;j<branches;j++){
   reset(i*20+j,43);const t=.33+j*.64/(branches-1),p=on(t),a=phi+(j%2?1:-1)*r(.55,1.7),reach=r(.48,.96)*(1-.55*t)*spread,up=r(.35,.78)*(1-.25*t)*height,mid=add(p,rad(a,reach*.49,up*.40)),end=add(p,rad(a,reach,up));branch([p,mid,end],.026*(1-.45*t),.0045,bark,hi?7:5);
   const along=f=>f<.5?add(p,mul(sub(mid,p),f*2)):add(mid,mul(sub(end,mid),(f-.5)*2));
   for(let k=0;k<twigs;k++){
    reset(i*100+j*10+k,57);const f=.25+k*.75/(twigs-1),q=along(f),a2=a+(k%2?1:-1)*r(.35,1.55),reach2=r(.17,.36),up2=r(.16,.36),m=add(q,rad(a2,reach2*.47,up2*.46)),tip=add(q,rad(a2,reach2,up2));branch([q,m,tip],.0055,.0015,twig,4);
    const point=f=>f<.5?add(q,mul(sub(m,q),f*2)):add(m,mul(sub(tip,m),(f-.5)*2));
    // Several connected short leafy sprays form a dense evergreen crown, not spheres.
    for(let l=0;l<leaves;l++){reset(i*10000+j*1000+k*100+l,79);const f=.18+l*.82/(leaves-1),node=point(f),az=a2+l*2.399+r(-.35,.35),pet=add(node,rad(az,r(.025,.055),r(.008,.045)));tube(node,pet,.0018,.00085,twig,3);compound(pet,az,i*10000+j*1000+k*100+l);}
    const id=i*100+j*10+k;reset(id,93);if((stage==="young"||stage==="mature")&&rand()<(stage==="young"?.40:.82)){
     raceme(tip,a2,id);
     reset(id,117);if(stage==="mature"&&k>=twigs-2&&rand()<.44){const p2=point(.84);raceme(p2,a2+.65,id+10000);}
    }else if((stage==="fall"||stage==="dry")&&rand()<.26)pod(tip,a2,id);
   }
  }
 }
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}

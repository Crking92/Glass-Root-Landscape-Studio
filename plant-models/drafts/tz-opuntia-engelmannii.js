// Original species-specific mesh, meters Y-up, display RGB.
export function buildSpecies(seed=42,stage="mature",detail="high"){
 const hi=detail==="high",md=detail==="medium",v=[],n=[],c=[],TAU=2*Math.PI;let state=seed>>>0;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),r=(a,b)=>a+(b-a)*rand(),reset=(i,s)=>{state=(Math.imul(seed+s,2654435761)^Math.imul(i+1,1597334677))>>>0;rand()};
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),tone=(a,t)=>a.map(x=>Math.max(0,Math.min(1,x*t))),rad=(a,s,y=0)=>[Math.cos(a)*s,y,Math.sin(a)*s];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-12)return;const normal=mul(q,1/l);for(const p of [a,b,d]){v.push(...p);n.push(...normal);c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function frame(d){const u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0]));return [u,cross(d,u)]}
 function tube(a,b,ra,rb,col,sides=4){const d=unit(sub(b,a)),[u,w]=frame(d),ring=(p,r,i)=>add(p,add(mul(u,r*Math.cos(i*TAU/sides)),mul(w,r*Math.sin(i*TAU/sides))));for(let i=0;i<sides;i++)quad(ring(a,ra,i),ring(a,ra,i+1),ring(b,rb,i+1),ring(b,rb,i),tone(col,.90+.12*Math.cos(i*TAU/sides)))}
 const dry=stage==="dry",fruit=stage==="fall",bloom=stage==="mature"||stage==="young";
 function flower(p,id){reset(id,71);const h=r(.020,.035),radius=r(.025,.043),col=mix([.97,.76,.15],[.99,.88,.31],r(0,.65)),center=add(p,[0,h,0]);tube(p,center,.008,.012,[.42,.55,.30],6);
 if(stage==="young"){tube(center,add(center,[0,.025,0]),.012,.002,[.82,.69,.24],6);return;}
 const layers=hi?3:2,petals=hi?13:md?9:7;for(let k=0;k<layers;k++)for(let j=0;j<petals;j++){const a=j*TAU/petals+k*.23,len=radius*(1-.19*k),side=rad(a+Math.PI/2,len*.25),base=add(center,rad(a,.003+k*.002,.002*k)),mid=add(center,rad(a,len*.68,.011+k*.006)),tip=add(center,rad(a,len,.023+k*.009));tri(base,add(mid,side),tip,tone(col,1-.05*k));tri(base,tip,sub(mid,side),tone(col,.93+.03*k));}
 for(let j=0;j<(hi?18:md?9:5);j++){const a=j*2.399,base=add(center,rad(a,r(.003,.008),.002)),end=add(base,rad(a,.003,r(.009,.018)));tube(base,end,.0008,.0013,[.94,.82,.44],3);}
 tube(center,add(center,[0,.022,0]),.0014,.002,[.70,.78,.29],4);
 }
 function tuna(p,id){reset(id,83);const h=r(.045,.070),col=mix([.52,.14,.25],[.68,.23,.35],r(0,.6)),a=add(p,[0,h*.18,0]),b=add(p,[0,h*.78,0]),d=add(p,[0,h,0]);tube(p,a,.008,.015,col,8);tube(a,b,.015,.019,col,8);tube(b,d,.019,.011,col,8);tube(d,add(d,[0,.001,0]),.011,.001,[.34,.17,.19],8);}
 let next=0;function pad(base,phi,tilt,level,max){const id=next++;reset(id,41);const length=r(.19,.31)*(level===0?1.06:1),width=length*r(.30,.43),thick=r(.012,.024),d=unit(rad(phi,Math.sin(tilt),Math.cos(tilt))),u=unit(cross([0,1,0],d)),side=Math.hypot(...u)<.5?rad(phi+Math.PI/2,1):u,w=unit(cross(d,side)),col=tone(mix([.35,.55,.38],[.48,.66,.51],r(0,.75)),r(.83,1.12)*(dry?.96:1)),N=hi?20:md?14:10,M=hi?12:md?9:7;
 const shape=(t,a)=>{const swell=Math.pow(Math.sin(Math.PI*t),.70)*(.73+.47*t);return add(base,add(mul(d,length*t),add(mul(side,width*swell*Math.cos(a)),mul(w,thick*swell*Math.sin(a)))))};
 for(let k=0;k<M;k++)for(let j=0;j<N;j++){const a=j*TAU/N,b=(j+1)*TAU/N;quad(shape(k/M,a),shape(k/M,b),shape((k+1)/M,b),shape((k+1)/M,a),tone(col,.93+.09*Math.sin(a)));}
 // Staggered areole rows on both flattened faces, plus sparse edge areoles.
 const rows=hi?5:md?4:3,cols=hi?5:md?4:3;for(let k=0;k<rows;k++)for(let j=0;j<cols;j++)for(const sign of [-1,1]){reset(id*1000+k*50+j*2+(sign>0?1:0),53);const t=.17+.68*k/(rows-1),x=-.76+1.52*(j+.20*(k%2))/(cols-1),a=sign*Math.acos(Math.max(-.90,Math.min(.90,x))),p=shape(t,a),normal=mul(w,sign),root=add(p,mul(normal,.0015));tube(p,root,.0025,.002,[.59,.49,.32],4);const spikes=hi?2+Math.floor(rand()*3):md?2:1;for(let z=0;z<spikes;z++){const angle=r(0,TAU),axis=unit(add(mul(normal,r(.6,1.2)),add(mul(side,Math.cos(angle)),mul(d,Math.sin(angle))))),end=add(root,mul(axis,r(.010,.031)));tube(root,end,hi?.00075:.001,.00005,[.78,.72,.47],3);}}
 reset(id,91);const terminal=level===max,children=terminal?0:level===0?(rand()<.52?2:1):level===1?(rand()<.30?2:1):(rand()<.18?2:1);
 if(children){for(let j=0;j<children;j++){reset(id*13+j,101);const edge=j%2?1:-1,a=children===1?r(.16,.55):edge*r(.35,.77),node=add(base,add(mul(d,length*(.86+r(-.045,.065))),mul(side,width*a*.60))),angle=phi+(children===1?r(-1,1):edge*r(.80,1.65));pad(node,angle,r(.25,.85),level+1,max);}}
 else if(bloom||fruit){reset(id,107);const count=rand()<.60?2:1;for(let j=0;j<count;j++){const p=add(base,add(mul(d,length*.91),mul(side,width*(j===0?-.30:.31))));if(fruit)tuna(p,id*3+j);else flower(p,id*3+j);}}
 }
 reset(0,17);const roots=hi?5:md?4:3;for(let i=0;i<roots;i++){reset(i,29);const phi=i*TAU/roots+r(-.35,.35);pad(rad(phi,r(.10,.29),0),phi,r(.32,.85),0,hi?3:md?3:2);}
 return {positions:new Float32Array(v),normals:new Float32Array(n),colors:new Float32Array(c)};
}
export const metadata={
  "id": "tz-opuntia-engelmannii",
  "scientific": "Opuntia engelmannii",
  "common": "Texas prickly pear",
  "primary": "https://www.wildflower.org/plants/result.php?id_plant=OPENL",
  "morphology": "https://efloras.org/florataxon.aspx?flora_id=1&taxon_id=242415194",
  "notes": "More open spreading clump with fewer basal and branching pads, reduced overlap; flattened green pads, staggered areoles, yellowish spines, yellow flowers and red-purple tunas. Central Texas variety informs appearance without changing species ID; glochids and seasons stylized.",
  "triangleCounts": {
    "high": 58860,
    "medium": 23894,
    "low": 5166
  },
  "tests": 75,
  "stageLabels": {
    "fall": "Fall / red tunas",
    "dry": "Winter / green pads"
  },
  "framing": "bounds",
  "revision": "owner review 01"
};

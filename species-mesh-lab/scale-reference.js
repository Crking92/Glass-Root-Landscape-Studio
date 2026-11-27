// True-scale reference helpers; all scene units meters, Studio dimensions feet.
export function parsePaletteDimensions(html){
 const marker="const species=[",start=html.indexOf(marker);if(start<0)throw Error("Studio palette not found");
 const end=html.indexOf("];",start);if(end<0)throw Error("Studio palette incomplete");
 const rows=JSON.parse(html.slice(start+14,end+1)),result=new Map();
 for(const s of rows){if(typeof s.id!=="string"||!Number.isFinite(s.w)||!Number.isFinite(s.h)||s.w<=0||s.h<=0||result.has(s.id))throw Error("Invalid Studio plant dimensions");result.set(s.id,{width:s.w,height:s.h,estimated:!!(s.widthEstimated||s.heightEstimated),override:s.designHeightOverride||"",provisional:!!s.provisional})}
 return result;
}
export function scaleScene(raw,size,showPerson=true){
 const FT=.3048,h=size.height*FT,w=size.width*FT,personHeight=6*FT;
 const gap=.36,personWidth=.61,left=-w/2,right=showPerson?w/2+gap+personWidth:w/2,center=(left+right)/2,personX=w/2+gap+personWidth/2-center;
 const p=[],n=[],c=[];
 for(let i=0;i<raw.positions.length;i+=3){p.push(raw.positions[i]*w-center,raw.positions[i+1]*h,raw.positions[i+2]*w);const x=raw.normals[i]/w,y=raw.normals[i+1]/h,z=raw.normals[i+2]/w,l=Math.hypot(x,y,z)||1;n.push(x/l,y/l,z/l);c.push(raw.colors[i],raw.colors[i+1],raw.colors[i+2]);}
 const sub=(a,b)=>a.map((x,i)=>x-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function tri(a,b,d,col){const q=cross(sub(b,a),sub(d,a)),l=Math.hypot(...q);if(l<1e-10)return;for(const pt of [a,b,d]){p.push(...pt);n.push(...q.map(x=>x/l));c.push(...col)}}
 function quad(a,b,d,e,col){tri(a,b,d,col);tri(a,d,e,col)}
 function ellipsoid(x,y,z,rx,ry,rz,col){const at=(a,b)=>[personX+x+rx*Math.sin(a)*Math.cos(b),y+ry*Math.cos(a),z+rz*Math.sin(a)*Math.sin(b)];for(let i=0;i<10;i++)for(let j=0;j<16;j++)quad(at(i*Math.PI/10,j*Math.PI/8),at((i+1)*Math.PI/10,j*Math.PI/8),at((i+1)*Math.PI/10,(j+1)*Math.PI/8),at(i*Math.PI/10,(j+1)*Math.PI/8),col)}
 const humanStart=p.length;
 if(showPerson){const skin=[.72,.61,.50],shirt=[.29,.39,.47],pants=[.28,.31,.34],shoe=[.19,.22,.24];
 // Stylized neutral standing scale figure: head crown is exactly six feet.
 ellipsoid(0,personHeight-.115,0,.091,.115,.092,skin);ellipsoid(0,1.575,0,.056,.075,.055,skin);
 ellipsoid(0,1.32,0,.185,.265,.103,shirt);ellipsoid(0,.98,0,.145,.125,.10,pants);
 for(const sign of [-1,1]){ellipsoid(sign*.085,.70,0,.075,.31,.074,pants);ellipsoid(sign*.085,.29,0,.061,.24,.060,pants);ellipsoid(sign*.085,.05,.039,.072,.05,.13,shoe);ellipsoid(sign*.213,1.35,0,.057,.18,.059,shirt);ellipsoid(sign*.25,1.075,0,.048,.14,.048,skin);ellipsoid(sign*.26,.935,0,.04,.065,.032,skin);}
 }
 const humanEnd=p.length;
 const span=Math.max(right-left,w,showPerson?personHeight:0,h,1.0),halfGrid=Math.ceil((span*.60+.35)/FT)*FT,gridStep=FT*Math.max(1,Math.ceil(halfGrid/FT/45)),lineWidth=Math.min(.012,gridStep*.025);
 for(let k=-Math.floor(halfGrid/gridStep);k<=Math.floor(halfGrid/gridStep);k++){const x=k*gridStep,col=k===0?[.54,.58,.54]:[.42,.47,.43];quad([x-lineWidth,-.008,-halfGrid],[x+lineWidth,-.008,-halfGrid],[x+lineWidth,-.008,halfGrid],[x-lineWidth,-.008,halfGrid],col);quad([-halfGrid,-.009,x-lineWidth],[halfGrid,-.009,x-lineWidth],[halfGrid,-.009,x+lineWidth],[-halfGrid,-.009,x+lineWidth],col)}
 return {positions:new Float32Array(p),normals:new Float32Array(n),colors:new Float32Array(c),bounds:{width:Math.max(right-left,w),height:Math.max(h,showPerson?personHeight:0),grid:halfGrid*2},plantHeight:h,plantWidth:w,personHeight:showPerson?personHeight:0,gridFeet:gridStep/FT,humanStart,humanEnd};
}

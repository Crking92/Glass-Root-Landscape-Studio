/* Shared, deterministic concept edging geometry in feet. */
(function(g){
'use strict';
const presets={
 steel:{name:'Steel edging',width:.08,height:.25,piece:6,colors:['#414d4e','#566061'],continuous:true},
 brick:{name:'Brick edging',width:.33,height:.24,piece:.67,colors:['#a26a50','#b57d5f','#935c48','#bb8769']},
 limestone:{name:'Limestone edging',width:.65,height:.42,piece:.9,colors:['#c9c0a5','#bcb59d','#ddd5bc','#ada58f']},
 sandstone:{name:'Sandstone edging',width:.65,height:.42,piece:1.1,colors:['#b99470','#c8a580','#ad8864','#d3b58e']},
 riverrock:{name:'River rock edging',width:.65,height:.34,piece:.65,colors:['#8e958e','#b0aaa0','#c8bb9f','#777f7d'],round:true},
 timber:{name:'Timber edging',width:.45,height:.32,piece:6,colors:['#806445','#a08461'],continuous:true}
};
function valid(e){return e===undefined||!!e&&typeof e==='object'&&!Array.isArray(e)&&Object.hasOwn(presets,e.kind)&&Number.isFinite(e.width)&&e.width>=.03&&e.width<=3&&Number.isFinite(e.height)&&e.height>=.05&&e.height<=2&&Number.isFinite(e.piece)&&e.piece>=.15&&e.piece<=8;}
function defaults(kind){const p=presets[kind];return {kind,width:p.width,height:p.height,piece:p.piece};}
function outline(o,bedPoints){return o.type==='bed'?bedPoints(o):[[o.x,o.y],[o.x+o.w,o.y],[o.x+o.w,o.y+o.h],[o.x,o.y+o.h]];}
function length(pts){return pts.reduce((n,a,j)=>{const b=pts[(j+1)%pts.length];return n+Math.hypot(b[0]-a[0],b[1]-a[1]);},0);}
function hash(str){let h=2166136261;for(const c of String(str))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function pieces(pts,e,id,limit=1800){if(!valid(e)||!e||pts.length<3||limit<1)return [];const p=presets[e.kind],total=length(pts),step=Math.max(e.piece,total/Math.max(1,limit-pts.length));const out=[];
 for(let j=0;j<pts.length;j++){const a=pts[j],b=pts[(j+1)%pts.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.001)continue;const n=Math.max(1,Math.ceil(len/step)),angle=Math.atan2(dy,dx);
  for(let k=0;k<n;k++){if(out.length>=limit)return out;const f=(k+.5)/n,h=hash(id+'|'+j+'|'+k),variation=(h%101)/100;out.push({x:a[0]+dx*f,y:a[1]+dy*f,angle,l:len/n*(p.continuous?1.015:.95),w:e.width*(p.round?.85+variation*.3:1),h:e.height*(p.round?.78+variation*.34:1),color:p.colors[h%p.colors.length],round:!!p.round,shape:['limestone','sandstone'].includes(e.kind)?'stone':p.round?'rock':'block',variant:h%4});}
 }return out;
}
function draw(ctx,pts,e,id,project,scale){if(!e||!valid(e)||pts.length<3)return;const p=presets[e.kind],width=Math.max(1,e.width*scale);ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();pts.forEach((a,j)=>{const b=project(a);j?ctx.lineTo(...b):ctx.moveTo(...b);});ctx.closePath();ctx.strokeStyle='#504a3d';ctx.lineWidth=width+1.2;ctx.stroke();ctx.strokeStyle=p.colors[0];ctx.lineWidth=width;ctx.stroke();
 if(!p.continuous&&e.piece*scale>=3&&width>=2){for(const a of pieces(pts,e,id,700)){const x=Math.cos(a.angle)*a.l/2,y=Math.sin(a.angle)*a.l/2,first=project([a.x-x,a.y-y]),last=project([a.x+x,a.y+y]);ctx.beginPath();ctx.moveTo(...first);ctx.lineTo(...last);ctx.strokeStyle=a.color;ctx.lineWidth=Math.max(1,a.w*scale);ctx.lineCap=a.round?'round':'butt';ctx.stroke();if(!a.round){const nx=-Math.sin(a.angle)*a.w/2,ny=Math.cos(a.angle)*a.w/2,b=project([a.x+x+nx,a.y+y+ny]),c=project([a.x+x-nx,a.y+y-ny]);ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(...c);ctx.lineWidth=.65;ctx.strokeStyle='#665746';ctx.stroke();}}}ctx.restore();}
g.StudioEdging={presets,valid,defaults,outline,length,pieces,draw};
})(globalThis);

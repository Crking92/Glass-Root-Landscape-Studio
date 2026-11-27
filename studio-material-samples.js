/* Original, lightweight material samples derived from the editor's procedural geometry. */
(function(g){
'use strict';
const surfaceColors={mulch:'#8c765b',gravel:'#b9b6a7',concrete:'#c4c8c5',dg:'#c5a47e',grass:'#7b9c62',soil:'#a38160'};
function poly(c,p,color,stroke){if(!p.length)return;c.beginPath();p.forEach((v,j)=>j?c.lineTo(...v):c.moveTo(...v));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.65;c.stroke();}}
function shade(hex,k){const n=parseInt(hex.slice(1),16);return '#'+[n>>16&255,n>>8&255,n&255].map(v=>Math.min(255,Math.max(0,Math.round(v*k))).toString(16).padStart(2,'0')).join('');}
function surface(c,key,pts,scale){if(g.PlanGraphics)g.PlanGraphics.surface(c,pts,key,'illustrated',scale,[0,0]);else poly(c,pts,surfaceColors[key]||'#a38160');}
function blank(c){c.strokeStyle='#827d70';c.lineWidth=2;c.setLineDash([5,4]);c.strokeRect(20,24,120,80);c.setLineDash([]);}
function edge(c,key){const E=g.StudioEdging,F=g.StudioFieldstone,e=E.defaults(key),preset=E.presets[key],length=key==='rusticlog'?16:Math.max(6,Math.min(9,e.piece*5)),scale=114/length,p=(x,z,y=0)=>[18+x*scale+(2-z)*11,86+x*.08*scale+z*9-y*scale],foot=[[0,0],[length,0],[length,4],[0,4]];
 poly(c,foot.map(v=>p(...v)),'#aaad84','#777b62');poly(c,[[0,0],[length,0],[length,1.95],[0,1.95]].map(v=>p(...v)),'#94765a');
 // Only the visible sample edge, not the whole closed outline. Both courses use the real piece layout.
 const pts=[[0,2],[length,2],[length,5],[0,5]],a=E.pieces(pts,e,'material-'+key,160).filter(v=>Math.abs(v.y-2)<e.width*.55&&v.x>=-.1&&v.x<=length+.1&&Math.abs(Math.cos(v.angle))>.65).sort((u,v)=>(u.z??u.h/2)-(v.z??v.h/2));
 for(const v of a){const co=Math.cos(v.angle),si=Math.sin(v.angle),shape=v.shape==='jagged'&&F?F.ring('edge-'+v.variant):v.round?Array.from({length:12},(_,j)=>[Math.cos(j*Math.PI/6)*.5,Math.sin(j*Math.PI/6)*.5]):[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]],ring=shape.map(([x,y])=>[v.x+x*v.l*co-y*v.w*si,v.y+x*v.l*si+y*v.w*co]),mid=v.z??v.h/2,lo=Math.max(0,mid-v.h/2),hi=mid+v.h/2;
 if(v.shape==='rustic'&&g.StudioRustic){g.StudioRustic.drawLog(c,(x,y)=>p(v.x+x*v.l*co-y*v.w*si,v.y+x*v.l*si+y*v.w*co,hi*.7),v.variant,v.wildness,v.color);continue;}
 const b=ring.map(v=>p(...v,lo)),t=ring.map(v=>p(...v,hi));for(let j=0;j<ring.length;j++){const k=(j+1)%ring.length;if(t[k][0]<t[j][0])poly(c,[b[j],b[k],t[k],t[j]],shade(v.color,.76+(j%2)*.08),'#645d4d');}poly(c,t,v.color,'#706656');
 }
 // Continuous metal and timber are very narrow in reality; give the sample a visible side face.
 if(!a.length&&preset.continuous){const q=[[0,2-e.width/2],[length,2-e.width/2],[length,2+e.width/2],[0,2+e.width/2]];poly(c,[p(...q[3]),p(...q[2]),p(...q[2],e.height),p(...q[3],e.height)],preset.colors[0],'#625c50');}
}
function draw(canvas,family,key,stone='limestone'){const c=canvas.getContext('2d');if(!c)return;c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#dbe1d0';c.fillRect(0,0,canvas.width,canvas.height);if(!key){blank(c);return;}if(family==='surface'){surface(c,key,[[8,8],[152,8],[152,120],[8,120]],18);return;}if(family==='edging'){edge(c,key);return;}if(family==='paving'){const P=g.StudioPaving,o={id:'paving-sample',type:'path',x:0,y:0,w:8,h:5,paving:{...P.defaults(key),material:stone}},pts=P.outline(o,v=>v.points),p=([x,y])=>[12+x*17,22+y*17];surface(c,'soil',pts.map(p),17);P.draw(c,o,pts,p);}}
g.StudioMaterialSamples={draw};
})(globalThis);

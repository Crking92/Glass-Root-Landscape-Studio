/* Original lightweight plan-view artwork. No geometry, model or editor mutations. */
(function(){
'use strict';
const sprites=new Map(),tiles=new Map(),LIMIT=192,SIZE=192,TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
const make=(n)=>{const c=document.createElement('canvas');c.width=c.height=n;return c;};
function hash(s){let n=2166136261;for(const ch of String(s))n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;}
function rng(seed){let a=seed>>>0;return ()=>{a=(Math.imul(a,1664525)+1013904223)>>>0;return a/4294967296;};}
function tint(hex,t){const n=parseInt(hex.slice(1),16),v=[n>>16&255,n>>8&255,n&255].map(x=>Math.round(Math.max(0,Math.min(255,t>0?x+(255-x)*t:x*(1+t)))));return 'rgb('+v.join(',')+')';}
function path(c,pts){c.beginPath();for(let i=0;i<pts.length;i++)i?c.lineTo(...pts[i]):c.moveTo(...pts[i]);c.closePath();}
function fill(c,color,stroke,width=1){c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function dot(c,x,y,rx,ry,color,angle=0){c.beginPath();c.ellipse(x,y,Math.max(.15,rx),Math.max(.15,ry),angle,0,TAU);fill(c,color);}
function line(c,pts,color,w){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function leaf(c,x,y,t,len,w,col,midrib=false){const dx=Math.cos(t),dy=Math.sin(t),nx=-dy,ny=dx;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+dx*len*.46+nx*w,y+dy*len*.46+ny*w,x+dx*len,y+dy*len);c.quadraticCurveTo(x+dx*len*.46-nx*w,y+dy*len*.46-ny*w,x,y);fill(c,col);if(midrib)line(c,[[x,y],[x+dx*len*.85,y+dy*len*.85]],'#e8e5bb44',.8);}
function blossom(c,x,y,r,color,petals){for(let k=0;k<petals;k++){const t=k*TAU/petals;dot(c,x+Math.cos(t)*r*.58,y+Math.sin(t)*r*.58,r*.56,r*.33,tint(color,k%2?.12:-.08),t);}dot(c,x,y,r*.33,r*.33,'#b3914b');}
function lobes(c,x,y,r,random,color,outline){const pts=Array.from({length:17},(_,i)=>{const t=i*TAU/17,v=r*(.85+.15*random());return [x+Math.cos(t)*v,y+Math.sin(t)*v];});c.beginPath();for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length],prev=pts[(i+pts.length-1)%pts.length];if(!i)c.moveTo((prev[0]+p[0])/2,(prev[1]+p[1])/2);c.quadraticCurveTo(...p,(p[0]+q[0])/2,(p[1]+q[1])/2);}c.closePath();fill(c,color,outline,.8);}
function palette(style,kind,ap){if(kind==='grass')return ap.foliage==='#b1a07a'?'#ae9871':style==='muhly'?'#78945e':'#81945b';if(kind==='succulent')return '#719984';if(kind==='tree')return style==='conifer'?'#4d704b':style==='airy'?'#80945a':'#577849';if(kind==='ground')return '#78965b';return '#678a4d';}
function sprite(style,kind,ap,variant,mode){
 const key=[style,kind,ap.leafless,ap.bloom,ap.bloom?ap.colors.join(','):'',ap.foliage,variant,mode].join('|');
 if(sprites.has(key)){const value=sprites.get(key);sprites.delete(key);sprites.set(key,value);return value;}
 const canvas=make(SIZE),c=canvas.getContext('2d'),random=rng(hash(key.replace(/\|(?:illustrated|presentation)$/,''))),hi=mode==='presentation',r=SIZE*.46,green=palette(style,kind,ap);
 c.translate(SIZE/2,SIZE/2);c.save();c.beginPath();c.arc(0,0,r,0,TAU);c.clip();
 const n=(a,b)=>a+(b-a)*random(),rad=(t,d)=>[Math.cos(t)*d,Math.sin(t)*d];
 if(ap.leafless){for(let i=0;i<10;i++){const t=i*GOLD+n(-.25,.25),p=rad(t,r*n(.55,.96)),m=rad(t+.1,r*.38);line(c,[[0,0],m,p],'#78654e',2.4);for(const k of [-1,1])line(c,[m,rad(t+k*.30,r*n(.66,.91))],'#917b5a',1.3);}dot(c,0,0,4,4,'#68523f');}
 else if(kind==='tree'||kind==='shrub'){
  lobes(c,0,0,r,random,tint(green,-.22),'#3b5940');
  const count=style==='airy'?19:hi?38:25;
  for(let i=0;i<count;i++){const t=i*GOLD+n(-.18,.18),u=Math.sqrt((i+.5)/count)*r*.76,[x,y]=rad(t,u),size=r*n(.20,.34),shade=n(-.16,.19)-(x+y)/r*.06;lobes(c,x,y,size,random,tint(green,shade));if(hi||i%2===0)for(let j=0;j<(hi?7:3);j++){const a=n(0,TAU),d=n(0,size*.68);dot(c,x+Math.cos(a)*d,y+Math.sin(a)*d,n(1.5,4.2),n(1,2.8),tint(green,shade+n(-.17,.22)),a);}}
  if(kind==='shrub'&&ap.bloom)for(let i=0;i<12;i++){const t=i*GOLD,[x,y]=rad(t,r*n(.25,.8));blossom(c,x,y,r*.055,ap.colors[i%ap.colors.length],5);}
 }else if(kind==='grass'){
  dot(c,0,0,r*.61,r*.61,tint(green,-.21));
  for(let i=0;i<(hi?92:55);i++){const t=i*GOLD+n(-.15,.15),u=r*n(.32,1),[x,y]=rad(t,u),[mx,my]=rad(t+n(-.42,.42),u*.58);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(mx,my,x,y);c.strokeStyle=tint(green,n(-.29,.33));c.lineWidth=n(1,3.8);c.lineCap='round';c.stroke();if(i%9===0&&ap.bloom)dot(c,x,y,2.2,1.2,'#d3bd95',t);}
  dot(c,0,0,r*.12,r*.12,tint(green,-.08));
 }else if(style==='rosette'||style==='spiky-rosette'){
  for(let i=0;i<(hi?25:17);i++){const t=i*GOLD,[x,y]=rad(t,n(0,r*.13));leaf(c,x,y,t,r*n(.53,.98),r*(style==='rosette'?.12:.044),tint(green,n(-.22,.29)),true);}
 }else if(style==='pads'){for(let i=0;i<15;i++){const t=i*GOLD,[x,y]=rad(t,r*n(.05,.71));dot(c,x,y,r*.23,r*.14,tint(green,n(-.18,.25)),t);if(hi)dot(c,x,y,1.5,1.5,'#e0d9bb');}}
 else if(kind==='fern'){for(let i=0;i<10;i++){const t=i*GOLD,len=r*n(.65,.98);line(c,[[0,0],rad(t,len)],tint(green,-.15),1.5);for(let j=1;j<=8;j++){const u=j/9,[x,y]=rad(t,len*u);for(const side of [-1,1])leaf(c,x,y,t+side*.85,r*.24*(1-u*.7),r*.032,tint(green,n(-.12,.27)));}}}
 else {
  lobes(c,0,0,r*.94,random,tint(green,-.17));
  const count=kind==='ground'?hi?70:42:hi?40:25;
  for(let i=0;i<count;i++){const t=i*GOLD,[x,y]=rad(t,r*Math.sqrt((i+.5)/count)*.76);leaf(c,x,y,t+n(-1,1),r*n(.16,.36),r*n(.045,.09),tint(green,n(-.24,.28)),hi);}
  if(ap.bloom)for(let i=0;i<(kind==='ground'?8:style==='cluster'?15:10);i++){const t=i*GOLD,[x,y]=rad(t,r*n(.15,.76));blossom(c,x,y,r*(style==='daisy'?.10:style==='spike'?.065:.078),ap.colors[i%ap.colors.length],style==='daisy'?8:5);}
 }
 c.restore();sprites.set(key,canvas);if(sprites.size>LIMIT)sprites.delete(sprites.keys().next().value);return canvas;
}
const surfaceColors={ground:'#aab995',mulch:'#92775c',gravel:'#b9b8a9',concrete:'#c9cbc4',dg:'#c4ab85',grass:'#839e68',soil:'#aa8969',pond:'#76a7a7',rain:'#879b73',creek:'#b7ad95'};
function tile(kind){if(tiles.has(kind))return tiles.get(kind);const canvas=make(128),c=canvas.getContext('2d'),random=rng(hash(kind)),base=surfaceColors[kind]||surfaceColors.soil;c.fillStyle=base;c.fillRect(0,0,128,128);
 const n=(a,b)=>a+(b-a)*random();
 for(let i=0;i<(kind==='ground'?340:kind==='concrete'?180:620);i++){
  const x=n(0,128),y=n(0,128),col=tint(base,n(-.21,.22));
  // Wrap marks over edges so the tile repeats without cut-off seams.
  for(const dx of [-128,0,128])for(const dy of [-128,0,128]){
   const X=x+dx,Y=y+dy;if(X<-12||Y<-12||X>140||Y>140)continue;
   if(kind==='mulch')dot(c,X,Y,n(2,6),n(.65,1.7),col,n(0,TAU));
   else if(kind==='creek'||kind==='gravel')dot(c,X,Y,n(1,kind==='creek'?5:3),n(1,2.4),col,n(0,TAU));
   else if(kind==='pond'){if(i%13===0)line(c,[[X-5,Y],[X+6,Y]],tint(base,.23),.8);}
   else if(['grass','ground','rain'].includes(kind)){if(i%2===0)line(c,[[X,Y+2],[X+n(-1,2),Y-1]],col,.85);}
   else dot(c,X,Y,n(.35,1.2),n(.4,1.3),col);
  }
 }
 if(kind==='concrete'){line(c,[[0,0],[128,0],[128,128]],'#a3a99f',1.4);}
 tiles.set(kind,canvas);return canvas;
}
function surface(c,pts,kind,mode,scale,origin,selected=false){if(!pts.length)return;c.save();const image=tile(kind),pattern=c.createPattern(image,'repeat'),size=Math.max(34,Math.min(220,scale*(kind==='concrete'?10:7)));if(pattern&&typeof pattern.setTransform==='function')pattern.setTransform(new DOMMatrix().translate(origin[0],origin[1]).scale(size/128));path(c,pts);fill(c,pattern||surfaceColors[kind]||surfaceColors.soil,selected?'#fff9be':kind==='ground'?'#d7dfc8':kind==='pond'?'#537e7f':'#665e4c',selected?2:1.1);if(mode==='presentation'&&kind==='pond'){c.clip();c.strokeStyle='#d3e2ca88';c.lineWidth=4;path(c,pts);c.stroke();}c.restore();}
function plant(c,{x,y,r,style,kind,appearance,id,angle,mode,count}){if(r<1.6){dot(c,x,y,Math.max(.4,r),Math.max(.4,r),palette(style,kind,appearance));return;}const variant=hash(id)%5,actualMode=mode==='presentation'&&count<=2500?'presentation':'illustrated';if(r<4||count>8000&&r<9){dot(c,x,y,r,r,palette(style,kind,appearance));return;}const image=sprite(style,kind,appearance,variant,actualMode);c.save();c.translate(x,y);c.rotate(angle);const d=r*2/(.92);c.drawImage(image,-d/2,-d/2,d,d);c.restore();}
function shadow(c,pts,offset,mode){if(!pts.length)return;c.save();c.translate(offset*.70,offset*.48);path(c,pts);c.fillStyle=mode==='presentation'?'rgba(40,50,32,.23)':'rgba(40,50,32,.13)';c.fill();c.restore();}
function plantShadow(c,x,y,r,offset,mode){if(r<3)return;c.save();const a=mode==='presentation'?.21:.12;dot(c,x+offset*.7,y+offset*.48,r*.96,r*.85,'rgba(38,48,31,'+a+')');c.restore();}
window.PlanGraphics={surface,plant,shadow,plantShadow};
})();

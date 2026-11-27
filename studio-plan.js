/* Original lightweight plan-view artwork. No geometry, model or editor mutations. */
(function(){
'use strict';
const sprites=new Map(),tiles=new Map(),shadowTiles=new Map(),LIMIT=192,SIZE=192,TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
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
function shadeFill(c,x,y,r,green,shade){const g=c.createLinearGradient(x-r*.65,y-r*.9,x+r*.65,y+r*.85);g.addColorStop(0,tint(green,Math.min(.6,shade+.15)));g.addColorStop(.53,tint(green,shade));g.addColorStop(1,tint(green,Math.max(-.7,shade-.17)));return g;}
function palette(style,kind,ap){if(kind==='grass')return ap.foliage==='#b1a07a'?'#ae9871':style==='muhly'?'#78945e':'#81945b';if(kind==='succulent')return '#719984';if(kind==='tree')return style==='conifer'?'#4d704b':style==='airy'?'#80945a':'#577849';if(kind==='ground')return '#78965b';return '#678a4d';}
function sprite(style,kind,ap,variant,mode){
 const key=[style,kind,ap.leafless,ap.bloom,ap.bloom?ap.colors.join(','):'',ap.foliage,variant,mode].join('|');
 if(sprites.has(key)){const value=sprites.get(key);sprites.delete(key);sprites.set(key,value);return value;}
 const canvas=make(SIZE),c=canvas.getContext('2d'),random=rng(hash(key.replace(/\|(?:illustrated|presentation)$/,''))),hi=mode==='presentation',r=SIZE*.46,green=palette(style,kind,ap);
 c.translate(SIZE/2,SIZE/2);c.save();c.beginPath();c.arc(0,0,r,0,TAU);c.clip();
 const n=(a,b)=>a+(b-a)*random(),rad=(t,d)=>[Math.cos(t)*d,Math.sin(t)*d];
 if(ap.leafless){for(let i=0;i<10;i++){const t=i*GOLD+n(-.25,.25),p=rad(t,r*n(.55,.96)),m=rad(t+.1,r*.38);line(c,[[0,0],m,p],'#78654e',2.4);for(const k of [-1,1])line(c,[m,rad(t+k*.30,r*n(.66,.91))],'#917b5a',1.3);}dot(c,0,0,4,4,'#68523f');}
 else if(kind==='tree'||kind==='shrub'){
  const airy=style==='airy',conifer=style==='conifer',upright=style==='upright-tree';
  // Leave gaps in airy crowns; dense woody canopies overlap natural, shaded foliage clusters.
  if(!airy)lobes(c,0,0,r,random,shadeFill(c,0,0,r,green,-.20),'#3b5940');
  else for(let i=0;i<9;i++){const t=i*GOLD;line(c,[[0,0],rad(t,r*.45),rad(t+.12,r*.82)],'#74674d',2);}
  const count=airy?hi?30:22:hi?45:29;
  const clusters=Array.from({length:count},(_,i)=>{const t=i*GOLD+n(-.24,.24),u=Math.sqrt((i+.5)/count)*r*(airy?.79:.74),[x,y]=rad(t,u),size=r*n(airy?.13:.19,airy?.25:.32);return {x,y,size,shade:n(-.15,.17)-(x+y)/r*.09};}).sort((a,b)=>a.x+a.y-b.x-b.y);
  for(const {x,y,size,shade} of clusters){
   if(conifer){const t=Math.atan2(y,x);for(let j=0;j<7;j++){const ang=t+(j-3)*.30;leaf(c,x-size*.18*Math.cos(t),y-size*.18*Math.sin(t),ang,size*n(.65,1.25),size*.19,tint(green,shade+n(-.12,.15)),hi);}}
   else {lobes(c,x,y,size,random,shadeFill(c,x,y,size,green,shade));for(let j=0;j<(hi?9:4);j++){const t=n(0,TAU),d=n(0,size*.65),X=x+Math.cos(t)*d,Y=y+Math.sin(t)*d,L=n(3.1,7.2);leaf(c,X,Y,t,L,L*(airy?.19:upright?.23:.39),tint(green,shade+n(-.20,.26)),hi&&j%3===0);}}
  }
  if(conifer)for(let i=0;i<(hi?26:16);i++){const t=i*GOLD,[x,y]=rad(t,r*n(.1,.84));leaf(c,x,y,t,r*n(.10,.22),r*.032,tint(green,n(-.10,.26)));}

  if(kind==='shrub'&&ap.bloom)for(let i=0;i<12;i++){const t=i*GOLD,[x,y]=rad(t,r*n(.25,.8));blossom(c,x,y,r*.055,ap.colors[i%ap.colors.length],5);}
 }else if(kind==='grass'){
  const upright=style==='upright-grass',strap=style==='strap-grass',muhly=style==='muhly',arch=style==='arching-grass';
  dot(c,0,0,r*(upright?.44:.50),r*(upright?.44:.50),shadeFill(c,0,0,r,green,-.22));
  for(let i=0;i<(hi?105:65);i++){const t=i*GOLD+n(-.19,.19),u=r*n(upright?.24:.39,1),[x,y]=rad(t,u),[mx,my]=rad(t+n(arch?-.55:-.30,arch?.55:.30),u*.56),[sx,sy]=rad(t,r*n(0,.10));c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(mx,my,x,y);c.strokeStyle=tint(green,n(-.28,.33));c.lineWidth=strap?n(2.5,5.0):muhly?n(.8,2.1):n(1,2.8);c.lineCap='round';c.stroke();
   if(ap.bloom&&i%7===0){const seed='#c7b18a';if(muhly){for(let j=0;j<5;j++){const a=t+j*GOLD;dot(c,x+Math.cos(a)*j*.95,y+Math.sin(a)*j*.95,1.15,.85,seed,a);}}else {dot(c,x,y,strap?3.4:2.5,1.2,seed,t);}}
  }
  dot(c,0,0,r*.10,r*.10,tint(green,-.09));
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
  const rx=n(1,kind==='mulch'?6:kind==='creek'?5:3),ry=n(.7,2.4),angle=n(0,TAU),bend=n(-1,2),grain=n(.35,1.3);
  // Identical marks wrap at edges; random values are sampled once per mark.
  for(const dx of [-128,0,128])for(const dy of [-128,0,128]){
   const X=x+dx,Y=y+dy;if(X<-12||Y<-12||X>140||Y>140)continue;
   if(kind==='mulch'){dot(c,X,Y,rx,ry*.63,col,angle);if(i%3===0)line(c,[[X-rx*.6*Math.cos(angle),Y-rx*.6*Math.sin(angle)],[X+rx*.6*Math.cos(angle),Y+rx*.6*Math.sin(angle)]],tint(base,.15),.45);}
   else if(kind==='creek'||kind==='gravel'){dot(c,X+.6,Y+.8,rx,ry,tint(base,-.27),angle);dot(c,X,Y,rx,ry,col,angle);if(i%4===0)dot(c,X-.5,Y-.5,rx*.55,ry*.45,tint(base,.25),angle);}
   else if(kind==='pond'){if(i%13===0){c.beginPath();c.moveTo(X-6,Y);c.quadraticCurveTo(X,Y-1.5,X+6,Y);c.strokeStyle=tint(base,.22);c.lineWidth=.85;c.stroke();}}
   else if(['grass','ground','rain'].includes(kind)){if(i%2===0)line(c,[[X,Y+2],[X+bend,Y-1]],col,.85);}
   else dot(c,X,Y,grain,grain*.75,col);
  }
 }
 if(kind==='concrete'){line(c,[[0,0],[128,0],[128,128]],'#a3a99f',1.4);}
 tiles.set(kind,canvas);return canvas;
}
function surface(c,pts,kind,mode,scale,origin,selected=false){if(!pts.length)return;c.save();const image=tile(kind),pattern=c.createPattern(image,'repeat'),size=Math.max(34,Math.min(220,scale*(kind==='concrete'?10:7)));if(pattern&&typeof pattern.setTransform==='function')pattern.setTransform(new DOMMatrix().translate(origin[0],origin[1]).scale(size/128));path(c,pts);fill(c,pattern||surfaceColors[kind]||surfaceColors.soil,selected?'#fff9be':kind==='ground'?'#d7dfc8':kind==='pond'?'#537e7f':'#665e4c',selected?2:1.1);if(mode==='presentation'&&kind!=='ground'){c.clip();path(c,pts);c.strokeStyle=kind==='pond'?'#345e5f55':'#3c382a33';c.lineWidth=Math.max(2,Math.min(8,scale*.5));c.stroke();if(kind==='pond'){path(c,pts);c.strokeStyle='#d3e2ca99';c.lineWidth=1.6;c.stroke();}}c.restore();}
function plant(c,{x,y,r,style,kind,appearance,id,angle,mode,count}){if(r<1.6){dot(c,x,y,Math.max(.4,r),Math.max(.4,r),palette(style,kind,appearance));return;}const variant=hash(id)%5,actualMode=mode==='presentation'&&count<=2500?'presentation':'illustrated';if(r<4||count>8000&&r<9){dot(c,x,y,r,r,palette(style,kind,appearance));return;}const image=sprite(style,kind,appearance,variant,actualMode);c.save();c.translate(x,y);c.rotate(angle);const d=r*2/(.92);c.drawImage(image,-d/2,-d/2,d,d);c.restore();}
function shadow(c,pts,offset,mode){if(!pts.length)return;c.save();const hi=mode==='presentation',alpha=hi?.22:.12;for(const [factor,a] of [[1.16,.23],[.92,.32],[.67,.45]]){c.save();c.translate(offset*.70*factor,offset*.48*factor);path(c,pts);c.fillStyle='rgba(37,47,31,'+(alpha*a)+')';c.fill();c.restore();}c.restore();}
function shadowTile(mode){if(shadowTiles.has(mode))return shadowTiles.get(mode);const tile=make(128),c=tile.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64),a=mode==='presentation'?.28:.17;g.addColorStop(0,'rgba(38,48,31,'+a+')');g.addColorStop(.58,'rgba(38,48,31,'+(a*.78)+')');g.addColorStop(.80,'rgba(38,48,31,'+(a*.30)+')');g.addColorStop(1,'rgba(38,48,31,0)');c.fillStyle=g;c.fillRect(0,0,128,128);shadowTiles.set(mode,tile);return tile;}
function plantShadow(c,x,y,r,offset,mode){if(r<3)return;const d=r*2.38,im=shadowTile(mode);c.drawImage(im,x+offset*.7-d/2,y+offset*.48-d*.42,d,d*.84);}
window.PlanGraphics={surface,plant,shadow,plantShadow};
})();

// Original seamless procedural ground tiles. One shared texture per material per scene.
// Tile sizes in feet: surface details repeat at world scale, not polygon scale.
export const groundStyles={
mulch:{tile:4,base:'#71543c',colors:['#513923','#856044','#a07852','#674933','#bb946c'],count:1400},
gravel:{tile:4,base:'#a39a86',colors:['#d9d2bf','#bdb5a0','#9f9787','#e4ddca','#827c70'],count:1800},
dg:{tile:3,base:'#bca07b',colors:['#d2b58d','#a58b6b','#c6a47b','#e0c8a2','#95806a'],count:6500},
concrete:{tile:8,base:'#bcbdb5',colors:['#a7aaa4','#d0d1c8','#b0b2aa','#c5c7bf'],count:4600},
grass:{tile:4,base:'#77884d',colors:['#576e3d','#859854','#9fa567','#647942','#b0aa72'],count:5200},
soil:{tile:4,base:'#997b59',colors:['#785c43','#b3926d','#84654c','#c2a17b','#a88866'],count:3800}
};
export function tileUV(x,y,tile){return [x/tile,-y/tile];}
export function paintGroundTile(c,kind){const p=groundStyles[kind];if(!p)throw Error('Unknown ground material');const n=c.width=c.height=512,ctx=c.getContext('2d');if(!ctx)throw Error('No texture canvas');let seed=135791+kind.charCodeAt(0)*53;const r=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),pick=()=>p.colors[Math.floor(r()*p.colors.length)];ctx.fillStyle=p.base;ctx.fillRect(0,0,n,n);
function repeat(x,y,radius,draw){for(const dx of [0,-n,n])for(const dy of [0,-n,n])if(x+dx+radius>=0&&x+dx-radius<=n&&y+dy+radius>=0&&y+dy-radius<=n){ctx.save();ctx.translate(x+dx,y+dy);draw();ctx.restore();}}
for(let i=0;i<120;i++){const x=r()*n,y=r()*n,rad=12+r()*42,col=pick();repeat(x,y,rad,()=>{const g=ctx.createRadialGradient(0,0,0,0,0,rad);g.addColorStop(0,col+'35');g.addColorStop(1,col+'00');ctx.fillStyle=g;ctx.fillRect(-rad,-rad,rad*2,rad*2);});}
for(let i=0;i<p.count;i++){const x=r()*n,y=r()*n,a=r()*Math.PI*2,col=pick(),len=kind==='mulch'?6+r()*34:kind==='gravel'?3+r()*11:kind==='grass'?2+r()*9:kind==='dg'?1+r()*3:kind==='soil'?1+r()*4:1+r()*2,wide=kind==='mulch'?2+r()*6:kind==='gravel'?len*(.48+r()*.42):kind==='grass'?.65+r()*1.3:len*.65;const jag=.7+r()*.5;
repeat(x,y,len+4,()=>{ctx.rotate(a);if(kind==='mulch'||kind==='gravel'){ctx.fillStyle='#302b2238';ctx.beginPath();ctx.ellipse(1.5,1.8,len*.53,wide*.65,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-len*.5,-wide*.26);ctx.lineTo(-len*.23,-wide*.5);ctx.lineTo(len*.36,-wide*.46);ctx.lineTo(len*.5,wide*.1);ctx.lineTo(len*.15,wide*.5);ctx.lineTo(-len*.38,wide*.32*jag);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff24';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-len*.35,-wide*.24);ctx.lineTo(len*.28,-wide*.28);ctx.stroke();}else if(kind==='grass'){ctx.strokeStyle=col;ctx.lineWidth=wide;ctx.beginPath();ctx.moveTo(-len*.5,0);ctx.quadraticCurveTo(0,-wide*1.8,len*.5,wide*.4);ctx.stroke();}else{ctx.globalAlpha=kind==='concrete'?.36:.72;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,0,len*.5,wide*.5,0,0,Math.PI*2);ctx.fill();}});}
return p.tile;}
export function makeGroundTextures(T,{textures,renderer}){const cache=new Map();return function get(kind){if(!groundStyles[kind])return null;if(cache.has(kind))return cache.get(kind);const canvas=document.createElement('canvas'),tile=paintGroundTile(canvas,kind),map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(map);const style={tile,map};cache.set(kind,style);return style;};}

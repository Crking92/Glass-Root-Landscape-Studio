export function scenicConfig(p={}){const num=(v,d,min,max)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):d;return {preset:['none','trees','hill','meadow'].includes(p.preset)?p.preset:'hill',density:num(p.density,.75,0,1),haze:num(p.haze,.55,0,1),clouds:num(p.clouds,.45,0,1)};}
function perimeterPoint(t,w,d){let q=((t%1+1)%1)*(2*w+2*d);if(q<w)return [q,0,0,-1];q-=w;if(q<d)return [w,q,1,0];q-=d;if(q<w)return [w-q,d,0,1];q-=w;return [0,d-q,-1,0];}
function scenicNoise(x,y){return .5+.22*Math.sin(x*.018+y*.012)+.17*Math.cos(x*.011-y*.023)+.11*Math.sin(x*.041+y*.029);}
export function scenicHeight(x,y,w,d,elev,preset){const bx=Math.max(0,Math.min(w,x)),by=Math.max(0,Math.min(d,y)),dist=Math.hypot(x-bx,y-by),rad=Math.max(w,d,10),t=Math.min(1,dist/Math.max(25,rad*.4)),fade=t*t*(3-2*t),edge=elev(bx,by),hill=preset==='hill'?Math.min(45,Math.max(10,rad*.20))*scenicNoise(x,y):preset==='trees'?2*scenicNoise(x,y):1*scenicNoise(x,y);return edge*(1-fade)+hill*fade-.025;}
export function scenicTrees(w,d,preset,density){if(preset==='none'||preset==='meadow'||density<=0)return [];const rad=Math.max(w,d,10),n=Math.min(180,Math.max(28,Math.round((w+d)*.30))),list=[];let seed=529311;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let row=0;row<2;row++)for(let i=0;i<n;i++){const t=(i+.25+rand()*.5)/n,[x,y,nx,ny]=perimeterPoint(t,w,d),out=12+Math.min(45,rad*.11)+row*(18+Math.min(50,rad*.16))+rand()*12,side=(rand()-.5)*5,h=12+rand()*17,spread=h*(.62+rand()*.46),tone=rand(),keep=rand();if(keep>density*(row===0?1:.78))continue;list.push({x:x+nx*out+ny*side,y:y+ny*out-nx*side,h,spread,tone,row});}return list;}
export function ringLayout(w,d,nx,ny){const edge=[];for(let i=0;i<nx;i++)edge.push([i/nx*w,0,-1,-1+2*i/nx]);for(let i=0;i<ny;i++)edge.push([w,i/ny*d,1,-1+2*i/ny]);for(let i=0;i<nx;i++)edge.push([w-i/nx*w,d,1-2*i/nx,1]);for(let i=0;i<ny;i++)edge.push([0,d-i/ny*d,-1,1-2*i/ny]); // top x expansion must follow x coordinate, z expansion fixed
 for(let i=0;i<nx;i++){edge[i][2]=-1+2*i/nx;edge[i][3]=-1;}
 const rad=Math.max(w,d,10),rings=[0,2,8,18,35,65,110,180,300,Math.max(500,rad*1.8),Math.max(850,rad*4),Math.max(1500,rad*9)].filter((v,i,a)=>i===0||v>a[i-1]);return {edge,rings};}
function cloudHash(x,y,seed){let n=Math.imul(x+seed,374761393)^Math.imul(y+seed*3,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function cloudNoise(x,y,period,seed){const a=x*period,b=y*period,i=Math.floor(a),j=Math.floor(b),wrap=v=>((v%period)+period)%period;let u=a-i,v=b-j;u=u*u*(3-2*u);v=v*v*(3-2*v);const h=(p,q)=>cloudHash(wrap(p),wrap(q),seed),a0=h(i,j)*(1-u)+h(i+1,j)*u,a1=h(i,j+1)*(1-u)+h(i+1,j+1)*u;return a0*(1-v)+a1*v;}
function cloudField(x,y){return .52*cloudNoise(x,y,5,17)+.25*cloudNoise(x,y,11,31)+.15*cloudNoise(x,y,23,43)+.08*cloudNoise(x,y,47,79);}
function skyAppearance(style,cover){const c=Number.isFinite(cover)?Math.max(0,Math.min(1,cover)):.45;return {cover:style==='cloud'?Math.min(1,c*1.5):c,disc:style==='cloud'?0:1,glow:style==='cloud'?.04:style==='evening'?.34:style==='morning'?.24:.17};}
export function makeScenery(T,{scene,geo,materials,textures,model,elevation,nx,ny,camera}){
 const group=new T.Group();scene.add(group);const w=model.width,d=model.depth,rad=Math.max(w,d,10),layout=ringLayout(w,d,nx,ny),{edge,rings}=layout;
 const cloudSize=256,cloudPixels=new Uint8Array(cloudSize*cloudSize*4);for(let j=0;j<cloudSize;j++)for(let i=0;i<cloudSize;i++){const v=Math.round(255*cloudField(i/cloudSize,j/cloudSize)),k=(j*cloudSize+i)*4;cloudPixels[k]=cloudPixels[k+1]=cloudPixels[k+2]=v;cloudPixels[k+3]=255;}
 const cloudTex=new T.DataTexture(cloudPixels,cloudSize,cloudSize);cloudTex.wrapS=cloudTex.wrapT=T.RepeatWrapping;cloudTex.magFilter=T.LinearFilter;cloudTex.minFilter=T.LinearMipmapLinearFilter;cloudTex.generateMipmaps=true;cloudTex.colorSpace=T.NoColorSpace;cloudTex.needsUpdate=true;textures.add(cloudTex);
 const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:false,toneMapped:true,uniforms:{horizon:{value:new T.Color('#d6dfd5')},zenith:{value:new T.Color('#93b6cf')},sunColor:{value:new T.Color('#fff0d7')},sunDir:{value:new T.Vector3(0,1,0)},glow:{value:.14},cloudMap:{value:cloudTex},cloudCover:{value:.45},cloudLight:{value:new T.Color('#f1eee4')},cloudShade:{value:new T.Color('#a7b6bd')},sunDisc:{value:1},cloudDrift:{value:new T.Vector2()}},vertexShader:'varying vec3 vDir; void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`
 varying vec3 vDir;
 uniform vec3 horizon,zenith,sunColor,sunDir,cloudLight,cloudShade;
 uniform float glow,cloudCover,sunDisc;uniform sampler2D cloudMap;uniform vec2 cloudDrift;
 void main(){
 vec3 dir=normalize(vDir);float h=max(0.,dir.y),t=pow(h,.53);
 vec3 c=mix(horizon,zenith,t);float sd=max(0.,dot(dir,normalize(sunDir)));
 float warm=pow(sd,9.)*glow*(.6+.4*(1.-h));c=mix(c,sunColor,warm);
 // Soft angular aureole and a small, visible solar disc; overcast hides it.
 float disc=smoothstep(.99975,.99992,sd)*sunDisc;
 float aura=pow(sd,180.)*.20*sunDisc;c=mix(c,sunColor,aura);
 c=mix(c,mix(sunColor,vec3(1.),.72),disc*.98);
 // Sample a seamless noise field on an apparent cloud plane, with horizon fade.
 if(cloudCover>.001&&dir.y>.025){
 vec2 q=dir.xz/(h+.28)*.39+vec2(.18,.47)+cloudDrift;
 float n=texture2D(cloudMap,q).r;
 float detail=texture2D(cloudMap,q*2.03+vec2(.21,.39)).r;
 float field=n*.83+detail*.17;
 float threshold=mix(.79,.29,cloudCover);
 float edge=smoothstep(threshold-.035,threshold+.075,field);
 float density=smoothstep(threshold-.01,threshold+.22,field);
 float coverage=edge*smoothstep(.025,.24,h)*smoothstep(0.,.16,cloudCover);
 vec3 cloud=mix(cloudLight,cloudShade,density*.67);
 cloud=mix(cloud,sunColor,pow(sd,16.)*.19*sunDisc);
 c=mix(c,cloud,coverage*.94);
 }
 gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 materials.add(skyMat);const sky=new T.Mesh(geo(new T.SphereGeometry(camera.far*.72,32,16)),skyMat);sky.frustumCulled=false;sky.renderOrder=-1000;group.add(sky);
 const terrainMat=new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide});materials.add(terrainMat);
 const terrainGeo=geo(new T.BufferGeometry()),p=[],colors=[],indices=[],samples=[];for(let j=0;j<rings.length;j++)for(const [x,y,dx,dy] of edge){const r=rings[j],wx=x+dx*r,wy=y+dy*r;p.push(wx-w/2,0,wy-d/2);colors.push(1,1,1);samples.push([wx,wy,r]);}
 const n=edge.length;for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const k=(i+1)%n,a=j*n+i,b=j*n+k,c=(j+1)*n+i,e=(j+1)*n+k;indices.push(a,c,b,b,c,e);}
 terrainGeo.setAttribute('position',new T.Float32BufferAttribute(p,3));terrainGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrainGeo.setIndex(indices);const terrain=new T.Mesh(terrainGeo,terrainMat);terrain.castShadow=false;terrain.receiveShadow=false;group.add(terrain);
 const treeMat=new T.MeshStandardMaterial({roughness:1,flatShading:true});materials.add(treeMat);const crown=new T.InstancedMesh(geo(new T.IcosahedronGeometry(.5,1)),treeMat,1080),trunks=new T.InstancedMesh(geo(new T.CylinderGeometry(.33,.5,1,6)),treeMat,360);for(const m of [crown,trunks]){m.count=0;m.castShadow=false;m.receiveShadow=false;m.frustumCulled=false;group.add(m);}
 const dummy=new T.Object3D(),horizon=new T.Color(),green=new T.Color(),color=new T.Color(),treeA=new T.Color('#425d36'),treeB=new T.Color('#7b915a'),soilA=new T.Color('#84935b'),soilB=new T.Color('#a6a476'),trunkColor=new T.Color('#74624b');let config=scenicConfig(),lastPreset=null,treeCount=0,light=null;
 function update(next,p){config=scenicConfig(next);if(p)light=p;group.visible=config.preset!=='none';if(!group.visible)return;if(!light)return;
 const appearance=skyAppearance(light.style,config.clouds),u=skyMat.uniforms;
 const evening=light.style==='evening',morning=light.style==='morning',overcast=light.style==='cloud';
 horizon.set(light.sky).lerp(new T.Color(evening?'#efc29a':morning?'#f0dbc2':overcast?'#d8dede':'#e1e7dc'),evening?.64:.52);
 u.horizon.value.copy(horizon);u.zenith.value.set(light.sky).lerp(new T.Color(evening?'#718fb4':morning?'#83a9cf':overcast?'#a6b4bd':'#639dcc'),.72);u.sunColor.value.set(light.sun);u.sunDir.value.set(...light.direction);u.glow.value=appearance.glow;u.sunDisc.value=appearance.disc;u.cloudCover.value=appearance.cover;
 u.cloudLight.value.set(evening?'#f5d6b8':morning?'#f6e6d7':overcast?'#d5dcdf':'#f6f6ed');u.cloudShade.value.set(evening?'#9a9ab3':morning?'#a8b5c6':overcast?'#9ba8b0':'#b0c1cb');
 const pos=terrainGeo.attributes.position,col=terrainGeo.attributes.color,change=lastPreset!==config.preset;for(let i=0;i<samples.length;i++){const [x,y,r]=samples[i];if(change)pos.setY(i,scenicHeight(x,y,w,d,elevation,config.preset));const t=scenicNoise(x,y),fade=Math.min(.93,config.haze*(1-Math.exp(-r/Math.max(70,rad*.55)))*1.12);color.copy(soilA).lerp(soilB,t).lerp(horizon,fade);col.setXYZ(i,color.r,color.g,color.b);}
 col.needsUpdate=true;if(change){pos.needsUpdate=true;terrainGeo.computeVertexNormals();terrainGeo.computeBoundingSphere();lastPreset=config.preset;}
 let ci=0,ti=0;const list=scenicTrees(w,d,config.preset,config.density);for(const o of list){const y=scenicHeight(o.x,o.y,w,d,elevation,config.preset),x=o.x-w/2,z=o.y-d/2,fade=config.haze*(o.row?.56:.26);dummy.rotation.set(0,0,0);dummy.position.set(x,y+o.h*.30,z);dummy.scale.set(o.h*.085,o.h*.60,o.h*.085);dummy.updateMatrix();trunks.setMatrixAt(ti,dummy.matrix);trunks.setColorAt(ti++,color.copy(trunkColor).lerp(horizon,fade));green.copy(treeA).lerp(treeB,o.tone).lerp(horizon,fade);for(let j=0;j<3;j++){const a=j*2.399+o.tone*6.28,offset=j===0?0:o.spread*.22;dummy.position.set(x+Math.cos(a)*offset,y+o.h*(j===0?.77:.66),z+Math.sin(a)*offset);dummy.rotation.set(0,a,0);dummy.scale.set(o.spread*(j===0?.85:.65),o.h*(j===0?.58:.43),o.spread*(j===0?.83:.67));dummy.updateMatrix();crown.setMatrixAt(ci,dummy.matrix);crown.setColorAt(ci++,color.copy(green).multiplyScalar(j===0?1:.91));}}
 crown.count=ci;trunks.count=ti;for(const m of [crown,trunks]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}treeCount=ti;
 }
 return {update,setMotion(t,s){skyMat.uniforms.cloudDrift.value.set((t*.004*s)%1,(t*.0017*s)%1);},follow(camera){if(group.visible)sky.position.copy(camera.position);},get count(){return group.visible?treeCount:0;},get preset(){return config.preset;}};
}
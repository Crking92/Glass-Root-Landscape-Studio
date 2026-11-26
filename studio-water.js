export function pondDepth(level,ground,auto){return auto?Math.max(0,Math.min(10,level-ground)):.65;}
export function reflectionChoice(ponds,x,y,z){let best=null,score=Infinity;for(const p of ponds){if(y<=p.level+.05)continue;const d=(x-p.x)**2+(z-p.z)**2+(y-p.level)**2*.35;if(d<score){best=p;score=d;}}return best;}
export function reflectedPoint(p,level){return [p[0],2*level-p[1],p[2]];}
export function waterFresnel(cosine){return .025+.975*(1-Math.max(0,Math.min(1,cosine)))**5;}
export function makeWaterKit(T,{renderer,scene,materials,cleanup}){
 const ponds=[],mirror=new T.PerspectiveCamera(),matrix=new T.Matrix4(),clip=new T.Plane(new T.Vector3(0,1,0),0),size=new T.Vector2();
 const dir=new T.Vector3(),up=new T.Vector3(),eye=new T.Vector3();let target=null,failed=false,active=null;
 const vertex=`
 attribute float waterDepth;
 varying vec3 vWorld;
 varying float vDepth;
 void main(){vec4 p=modelMatrix*vec4(position,1.0);vWorld=p.xyz;vDepth=waterDepth;gl_Position=projectionMatrix*viewMatrix*p;}`;
 const fragment=`
 varying vec3 vWorld;varying float vDepth;
 uniform vec3 sky;uniform vec3 horizon;uniform vec3 sunColor;uniform vec3 sunDirection;
 uniform sampler2D reflectionMap;uniform mat4 reflectionMatrix;uniform float hasReflection;uniform float rippleTime;uniform float rippleStrength;
 void main(){
  vec3 viewDir=normalize(cameraPosition-vWorld);
  vec2 q=vWorld.xz;
  float u=dot(q,vec2(.81,.39))+rippleTime*.55*rippleStrength,v=dot(q,vec2(-.44,1.12))-rippleTime*.32*rippleStrength;
  float wave=sin(u*2.1+.55*sin(v*.9))*.50+sin(v*3.3+.65*cos(u*.6))*.27+sin((u+v)*5.4)*.12;
  vec2 ripple=vec2(cos(u*2.1+.55*sin(v*.9))*.055+sin((u+v)*5.4)*.021,cos(v*3.3+.65*cos(u*.6))*.043+cos((u-v)*4.2)*.018);
  vec3 n=normalize(vec3(ripple.x,1.,ripple.y));
  vec3 ray=reflect(-viewDir,n);
  float f=.025+.975*pow(1.-clamp(dot(n,viewDir),0.,1.),5.);
  vec3 refl=mix(horizon,sky,pow(clamp(ray.y,0.,1.),.6));
  vec4 uvp=reflectionMatrix*vec4(vWorld,1.);
  vec2 uv=uvp.xy/max(.00001,uvp.w)*.5+.5+ripple*.045;
  float inside=step(.002,uv.x)*step(.002,uv.y)*step(uv.x,.998)*step(uv.y,.998)*step(.00001,uvp.w);
  if(hasReflection>.5&&inside>.5)refl=texture2D(reflectionMap,uv).rgb;
  float deep=1.-exp(-max(0.,vDepth)*1.6);
  vec3 shallow=vec3(.25,.31,.17),dark=vec3(.038,.145,.125);
  vec3 body=mix(shallow,dark,deep)*(1.+wave*.045);
  vec3 col=mix(body,refl,clamp(.11+f*.83,0.,.96));
  float glint=pow(max(0.,dot(ray,normalize(sunDirection))),95.);
  col+=sunColor*glint*.65;
  float alpha=clamp(.54+deep*.40+f*.32,.54,1.);
  gl_FragColor=vec4(col,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;
 function material(){const m=new T.ShaderMaterial({uniforms:{sky:{value:new T.Color('#a9c9d7')},horizon:{value:new T.Color('#d3dbca')},sunColor:{value:new T.Color('#fff0d7')},sunDirection:{value:new T.Vector3(0,1,0)},reflectionMap:{value:null},reflectionMatrix:{value:new T.Matrix4()},hasReflection:{value:0},rippleTime:{value:0},rippleStrength:{value:0}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,side:T.DoubleSide});materials.add(m);return m;}
 function add(mesh,level,x,z){mesh.renderOrder=125;mesh.castShadow=false;mesh.receiveShadow=false;ponds.push({mesh,level,x,z});}
 function lighting(light){for(const p of ponds){const u=p.mesh.material.uniforms;u.sky.value.set(light.sky).lerp(new T.Color(light.style==='evening'?'#8297b5':'#77a5cc'),.4);u.horizon.value.set(light.sky).lerp(new T.Color('#e2e5cf'),.5);u.sunColor.value.set(light.sun).multiplyScalar(light.style==='cloud'?.12:1);u.sunDirection.value.set(...light.direction);}}
 function reflect(camera,enabled,scenery){active=null;for(const p of ponds)p.mesh.material.uniforms.hasReflection.value=0;if(failed||!enabled||!ponds.length)return;
 const p=reflectionChoice(ponds,camera.position.x,camera.position.y,camera.position.z);if(!p)return;
 const oldTarget=renderer.getRenderTarget(),oldClip=renderer.clippingPlanes,oldShadow=renderer.shadowMap.needsUpdate,oldAuto=renderer.shadowMap.autoUpdate;const vis=ponds.map(p=>p.mesh.visible);
 try{
  renderer.getSize(size);const long=Math.min(768,renderer.capabilities.maxTextureSize),ratio=size.x/Math.max(1,size.y),rw=Math.max(1,Math.round(long*Math.min(1,ratio))),rh=Math.max(1,Math.round(long/Math.max(1,ratio)));
  if(!target){target=new T.WebGLRenderTarget(rw,rh,{type:renderer.extensions.has('EXT_color_buffer_float')?T.HalfFloatType:T.UnsignedByteType,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:true});target.texture.colorSpace=T.LinearSRGBColorSpace;}else if(target.width!==rw||target.height!==rh)target.setSize(rw,rh);
  mirror.position.set(...reflectedPoint(camera.position.toArray(),p.level));camera.getWorldDirection(dir);dir.y=-dir.y;up.set(0,1,0).applyQuaternion(camera.quaternion);up.y=-up.y;mirror.up.copy(up);mirror.lookAt(eye.copy(mirror.position).add(dir));mirror.near=camera.near;mirror.far=camera.far;mirror.projectionMatrix.copy(camera.projectionMatrix);mirror.projectionMatrixInverse.copy(camera.projectionMatrixInverse);mirror.updateMatrixWorld(true);matrix.multiplyMatrices(mirror.projectionMatrix,mirror.matrixWorldInverse);
  for(const q of ponds)q.mesh.visible=false;clip.constant=-p.level+.012;renderer.clippingPlanes=[clip];renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;scenery?.follow(mirror);renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,mirror);
  const u=p.mesh.material.uniforms;u.reflectionMap.value=target.texture;u.reflectionMatrix.value.copy(matrix);u.hasReflection.value=1;active=p;
 }catch(e){failed=true;console.warn('Pond reflection unavailable; using sky reflection',e);}finally{renderer.setRenderTarget(oldTarget);renderer.clippingPlanes=oldClip;renderer.shadowMap.autoUpdate=oldAuto;renderer.shadowMap.needsUpdate=oldShadow;for(let i=0;i<ponds.length;i++)ponds[i].mesh.visible=vis[i];scenery?.follow(camera);}
 }
 cleanup.add(()=>target?.dispose());
 return {material,add,lighting,reflect,setMotion(t,s){for(const p of ponds){p.mesh.material.uniforms.rippleTime.value=t;p.mesh.material.uniforms.rippleStrength.value=s;}},get count(){return ponds.length;},get reflected(){return !!active;}};
}
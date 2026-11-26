export function aoSize(w,h,cap=1440){const f=Math.min(1,cap/Math.max(w,h));return [Math.max(1,Math.round(w*f)),Math.max(1,Math.round(h*f))];}
export function aoEligible(detail,enabled,plants,triangles,hardParts,moving){return enabled!==false&&detail==='detailed'&&plants<=350&&triangles<=1800000&&hardParts<=12000&&!moving;}
export function makeOcclusion(T,{renderer,scene,cleanup}){
 // Render opaque and transparent scene color once, retaining opaque depth. A bounded
 // view-space depth-neighborhood estimate darkens nearby occluding surfaces.
 const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1),size=new T.Vector2();
 const uniforms={colorMap:{value:null},depthMap:{value:null},invProjection:{value:new T.Matrix4()},projection:{value:new T.Matrix4()},pixel:{value:new T.Vector2()},strength:{value:.36}};
 const shader=new T.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:true,vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform sampler2D colorMap;uniform sampler2D depthMap;uniform mat4 invProjection;uniform mat4 projection;uniform vec2 pixel;uniform float strength;
 vec3 viewPos(vec2 uv,float depth){vec4 p=invProjection*vec4(uv*2.-1.,depth*2.-1.,1.);return p.xyz/p.w;}
 float depthAt(vec2 uv){return texture2D(depthMap,clamp(uv,vec2(.001),vec2(.999))).r;}
 void main(){
 vec3 c=texture2D(colorMap,vUv).rgb;float d=depthAt(vUv);
 if(d<.999999){
 vec3 p=viewPos(vUv,d);
 vec3 px=viewPos(vUv+vec2(pixel.x,0.),depthAt(vUv+vec2(pixel.x,0.)))-p;
 vec3 nx=viewPos(vUv-vec2(pixel.x,0.),depthAt(vUv-vec2(pixel.x,0.)))-p;
 vec3 py=viewPos(vUv+vec2(0.,pixel.y),depthAt(vUv+vec2(0.,pixel.y)))-p;
 vec3 ny=viewPos(vUv-vec2(0.,pixel.y),depthAt(vUv-vec2(0.,pixel.y)))-p;
 vec3 dx=dot(px,px)<dot(nx,nx)?px:-nx,dy=dot(py,py)<dot(ny,ny)?py:-ny;
 vec3 normal=cross(dx,dy);float nl=length(normal);
 if(nl>.000001){
 normal/=nl;if(dot(normal,-p)<0.)normal=-normal;
 float radius=clamp(-p.z*.016,.28,1.65);
 vec2 extent=vec2(projection[0][0],projection[1][1])*radius/max(.1,-p.z)*.5;
 extent=clamp(extent,pixel*2.,pixel*22.);
 float occ=0.,weight=0.;
 for(int i=0;i<12;i++){
 float angle=float(i)*2.39996323;float r=.38+.62*float(i%4)/3.;
 vec2 uv=vUv+vec2(cos(angle),sin(angle))*extent*r;
 if(uv.x<=0.||uv.y<=0.||uv.x>=1.||uv.y>=1.)continue;
 float sd=depthAt(uv);if(sd>=.999999)continue;
 vec3 delta=viewPos(uv,sd)-p;float len=length(delta);
 if(len<.025||len>radius*1.6)continue;
 float falloff=1.-smoothstep(radius*.18,radius*1.6,len);
 occ+=max(0.,dot(normal,delta/len)-.12)*falloff;weight+=1.;
 }
 float ao=clamp(occ/max(4.,weight)*2.1,0.,1.);
 c*=1.-strength*ao;
 }}
 gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const quad=new T.Mesh(new T.PlaneGeometry(2,2),shader);quad.frustumCulled=false;postScene.add(quad);
 let target=null,failed=false,active=false,sceneCalls=0;
 function render(camera,enabled,overlays=[]){active=false;sceneCalls=0;if(failed||!enabled){renderer.render(scene,camera);sceneCalls=renderer.info.render.calls;return;}
 const oldTarget=renderer.getRenderTarget(),oldTone=renderer.toneMapping,oldAuto=renderer.autoClear,vis=overlays.map(o=>o.visible);
 try{
 renderer.getDrawingBufferSize(size);const limit=Math.min(2048,renderer.capabilities.maxTextureSize);if(Math.max(size.x,size.y)>limit||size.x*size.y>3145728){renderer.render(scene,camera);sceneCalls=renderer.info.render.calls;return;}const [w,h]=aoSize(size.x,size.y,limit);
 if(!target){target=new T.WebGLRenderTarget(w,h,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:true});target.texture.colorSpace=T.LinearSRGBColorSpace;target.depthTexture=new T.DepthTexture(w,h,T.UnsignedIntType);target.depthTexture.minFilter=target.depthTexture.magFilter=T.NearestFilter;}else if(target.width!==w||target.height!==h)target.setSize(w,h);
 for(const o of overlays)o.visible=false;
 renderer.setRenderTarget(target);renderer.autoClear=true;renderer.render(scene,camera);sceneCalls=renderer.info.render.calls;
 uniforms.colorMap.value=target.texture;uniforms.depthMap.value=target.depthTexture;uniforms.invProjection.value.copy(camera.projectionMatrixInverse);uniforms.projection.value.copy(camera.projectionMatrix);uniforms.pixel.value.set(1/w,1/h);
 renderer.setRenderTarget(oldTarget);renderer.render(postScene,postCamera);
 // Selection overlays are intentionally shown in direct-render mode (see caller).
 active=true;
 }catch(e){failed=true;console.warn('Ambient occlusion disabled; using direct rendering',e);}finally{renderer.setRenderTarget(oldTarget);renderer.toneMapping=oldTone;renderer.autoClear=oldAuto;overlays.forEach((o,i)=>o.visible=vis[i]);}
 if(!active){renderer.render(scene,camera);sceneCalls=renderer.info.render.calls;}
 }
 cleanup.add(()=>{target?.dispose();quad.geometry.dispose();shader.dispose();});
 return {render,get active(){return active;},get calls(){return sceneCalls;}};
}
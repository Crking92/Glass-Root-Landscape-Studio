/* One on-demand WebGL plant preview; same mesh data as production Studio. */
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {catalogPlantGeometry} from './studio-three.js?v=1360';
export async function createCatalogPreview(host){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const cv=renderer.domElement;cv.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';cv.tabIndex=0;cv.setAttribute('aria-label','Rotatable 3D plant preview. Drag to rotate, scroll to zoom.');host.replaceChildren(cv);
 const scene=new T.Scene();scene.background=new T.Color('#dce3d4');const camera=new T.PerspectiveCamera(38,1,.01,100),ambient=new T.HemisphereLight('#fff9ed','#78866b',2.2),sun=new T.DirectionalLight('#fff2d6',2.8),fill=new T.DirectionalLight('#d7e8ff',1);sun.position.set(3,5,4);fill.position.set(-3,2,-2);scene.add(ambient,sun,fill);
 const mat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.95}),baseGeo=new T.CircleGeometry(1.15,64),baseMat=new T.MeshStandardMaterial({color:'#a9b79c',roughness:1});baseGeo.rotateX(-Math.PI/2);const base=new T.Mesh(baseGeo,baseMat);base.position.y=-.012;scene.add(base);
 let mesh=null,az=.65,el=.25,zoom=1,target=.45,dist=3,disposed=false,drag=null,frame=0;const cleanup=[];
 function render(){frame=0;if(disposed)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const d=dist/zoom;camera.position.set(d*Math.cos(el)*Math.sin(az),target+d*Math.sin(el),d*Math.cos(el)*Math.cos(az));camera.lookAt(0,target,0);renderer.render(scene,camera);}
 function request(){if(!disposed&&!frame)frame=requestAnimationFrame(render);}
 function listen(type,fn,opts){cv.addEventListener(type,fn,opts);cleanup.push(()=>cv.removeEventListener(type,fn,opts));}
 function reset(){az=.65;el=.25;zoom=1;request();}
 function rotate(dir){az+=dir*Math.PI/6;request();}
 function magnify(k){zoom=Math.max(.55,Math.min(3.2,zoom*k));request();}
 async function setPlant(s,style,ap,month,prototypes){const registry=prototypes?await import('./plant-models/registry.js').catch(()=>null):null;if(disposed)return null;const {raw,source}=catalogPlantGeometry(s,style,ap,month,registry);const g=new T.BufferGeometry();for(const [name,v] of [['position',raw.positions],['normal',raw.normals],['color',raw.colors]])g.setAttribute(name,new T.BufferAttribute(v,3));g.computeBoundingSphere();if(mesh){scene.remove(mesh);mesh.geometry.dispose();}mesh=new T.Mesh(g,mat);const span=Math.max(.1,s.w,s.h);mesh.scale.set(s.w/span,s.h/span,s.w/span);scene.add(mesh);base.scale.setScalar(Math.max(.36,s.w/span*.72));target=s.h/span*.48;dist=3.0;reset();render();return {source,triangles:raw.positions.length/9};}
 listen('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';});
 listen('pointermove',e=>{if(drag?.id!==e.pointerId)return;az-=(e.clientX-drag.x)*.012;el=Math.max(-.12,Math.min(1.48,el+(e.clientY-drag.y)*.012));drag.x=e.clientX;drag.y=e.clientY;request();});
 for(const k of ['pointerup','pointercancel','lostpointercapture'])listen(k,()=>{drag=null;cv.style.cursor='grab';});
 listen('wheel',e=>{e.preventDefault();magnify(Math.exp(-Math.max(-120,Math.min(120,e.deltaY))*.003));},{passive:false});
 listen('keydown',e=>{if(['ArrowLeft','ArrowRight','+','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')rotate(-1);else if(e.key==='ArrowRight')rotate(1);else if(e.key==='+')magnify(1.2);else if(e.key==='-')magnify(1/1.2);else reset();}});
 const observer=new ResizeObserver(request);observer.observe(host);request();
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();cleanup.forEach(f=>f());mesh?.geometry.dispose();mat.dispose();baseGeo.dispose();baseMat.dispose();renderer.dispose();cv.remove();}
 return {setPlant,rotate,magnify,reset,dispose};
}

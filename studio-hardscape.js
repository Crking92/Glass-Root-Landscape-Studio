// Procedural hardscape kit. Local dimensions are normalized to the saved w, h, height.
export function hardParts(o,detail=true){
 const out=[],kind=o.kind,seed=[...String(o.id)].reduce((s,c)=>Math.imul(s,31)+c.charCodeAt(0)|0,7);let s=seed>>>0;const r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const part=(shape,color,x,y,z,w,h,d)=>out.push({shape,color,x,y,z,w,h,d});
 const b=(c,x,y,z,w,h,d)=>part('box',c,x,y,z,w,h,d);
 const rock=()=> 'rock'+Math.floor(r()*4),wood=['#a77c4f','#9e754c','#b18b5c','#896342','#bd976c'],stone=['#bdb29c','#d0c5ae','#b2a78f','#c7bea8','#a99e87'],pick=a=>a[Math.floor(r()*a.length)],dark='#68533e',metal='#505653';
 if(kind==='boulder'||kind==='stepping'){part(rock(),pick(stone),0,.5,0,1,1,1);return out;}
 if(!detail&&kind!=='birdbath'){b(kind==='wall'?stone[0]:wood[0],0,.5,0,1,1,1);return out;}
 if(kind==='bench'){for(const x of [-.36,.36]){for(const z of [-.31,.31])b(metal,x,.23,z,.055,.46,.09);b(metal,x,.44,0,.055,.075,.85);b(metal,x,.71,-.35,.045,.50,.09);}for(let i=0;i<5;i++)b(pick(wood),0,.49,-.34+i*.15,1,.065,.135);for(let i=0;i<4;i++)b(pick(wood),0,.65+i*.10,-.37,1,.085,.08);}
 else if(kind==='table'){for(const x of [-.37,.37]){for(const z of [-.16,.16])b(dark,x,.45,z,.075,.90,.09);b(dark,x,.44,0,.085,.10,1);}for(let i=0;i<6;i++)b(pick(wood),0,.96,-.22+i*.088,1,.08,.082);for(const z of [-.40,.40])for(let i=0;i<2;i++)b(pick(wood),0,.49,z+(i-.5)*.10,1,.08,.095);}
 else if(kind==='planter'){const t=Math.min(.08,.28/o.w),d=Math.min(.12,.28/o.h);for(const z of [-.5+d/2,.5-d/2])for(let row=0;row<3;row++)b(pick(wood),0,(row+.5)/3,z,1,.323,d);for(const x of [-.5+t/2,.5-t/2])for(let row=0;row<3;row++)b(pick(wood),x,(row+.5)/3,0,t,.323,1-2*d);b('#72553b',0,.82,0,1-2*t,.10,1-2*d);for(const x of [-.5+t/2,.5-t/2])for(const z of [-.5+d/2,.5-d/2])b(dark,x,.5,z,t,1,d);}
 else if(kind==='birdbath'){part('cylinder',stone[0],0,.065,0,.65,.13,.65);part('pedestal',stone[1],0,.43,0,.38,.68,.38);part('bowl',stone[0],0,.86,0,1,.28,1);part('cylinder','#759ea3',0,.948,0,.78,.014,.78);}
 else if(kind==='woodfence'){const n=Math.min(144,Math.max(2,Math.ceil(o.w/.48))),posts=Math.min(50,Math.max(2,Math.ceil(o.w/7)+1)),pw=Math.min(.15,.28/o.w);for(let i=0;i<n;i++)b(pick(wood),(i+.5)/n-.5,.5,0,.97/n,1,.57);for(const y of [.24,.70])b(dark,0,y,-.32,1,.09,.30);for(let i=0;i<posts;i++)b(dark,-.5+pw/2+i*(1-pw)/(posts-1),.49,0,pw,.98,1);}
 else if(kind==='wall'){const rows=Math.min(10,Math.max(1,Math.ceil(o.height/.55))),cols=Math.min(100,Math.max(1,Math.ceil(o.w/1.45)));b('#8c8272',0,.49,0,1,.96,.92);for(let row=0;row<rows;row++){const cuts=[-.5];for(let j=1;j<=cols;j++){const x=(j-(row%2)*.5)/cols-.5;if(x>-.5&&x<.5)cuts.push(x);}cuts.push(.5);for(let j=0;j<cuts.length-1;j++){const a=cuts[j],c=cuts[j+1],w=c-a;b(pick(stone),(a+c)/2,(row+.5)*.93/rows,0,w*.98,.91/rows,1);}}b(stone[1],0,.965,0,1,.07,1);}
 else if(kind==='pergola'){const pw=Math.min(.15,.5/o.w),pd=Math.min(.15,.5/o.h);for(const x of [-.43,.43])for(const z of [-.43,.43])b(dark,x,.45,z,pw,.90,pd);for(const z of [-.43,.43])b(wood[0],0,.875,z,1,.10,pd*1.3);const n=Math.min(32,Math.max(4,Math.ceil(o.w/1.5)));for(let i=0;i<n;i++)b(pick(wood),-.46+i*.92/(n-1),.955,0,Math.min(.8/n,.27/o.w),.09,1);for(const z of [-.27,0,.27])b(wood[2],0,.99,z,1,.02,pd*.65);}
 else if(kind==='shed'){b('#b5b7a6',0,.37,0,.96,.74,.96);const n=Math.min(22,Math.max(3,Math.ceil(o.w/.7)));for(let i=0;i<n;i++)b(i%2?'#a4ad98':'#afb8a3',-.45+i*.90/(n-1),.37,.487,.91/n,.73,.026);part('roof','#59645c',0,.87,0,1,.26,1);b('#ddd9ca',0,.31,.485,.48,.62,.03);b('#787d70',0,.30,.497,.43,.60,.006);b(dark,.15,.30,.5,.025,.022,.009);for(const x of [-.30,.30])b('#4f686e',x,.55,-.489,.22,.20,.022);}
 else b(wood[0],0,.5,0,1,1,1);
 return out;
}
export function localPlacement(o,p){const a=-(o.angle||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=p.x*o.w,z=p.z*o.h;return {x:o.x+c*x+s*z,y:o.y-s*x+c*z,z:p.y*o.height,scale:[p.w*o.w,p.h*o.height,p.d*o.h],angle:a};}
export function steppedSections(o,elevation){
 if(!['woodfence','wall'].includes(o.kind))return [o];
 const n=Math.min(48,Math.max(1,Math.ceil(o.w/(o.kind==='wall'?4:6)))),a=(o.angle||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const z=t=>elevation(o.x+c*t,o.y+s*t);
 let lo=Infinity,hi=-Infinity;for(let i=0;i<=n*4;i++){const v=z(o.w*(i/(n*4)-.5));lo=Math.min(lo,v);hi=Math.max(hi,v);}
 if(hi-lo<.04)return [o];
 const sections=[];for(let i=0;i<n;i++){const w=o.w/n,t=(i+.5)*w-o.w/2,x=o.x+c*t,y=o.y+s*t,center=z(t);let bottom=center;
 for(let j=0;j<=4;j++)bottom=Math.min(bottom,z(t+w*(j/4-.5)));
 sections.push({...o,id:o.id+'-section-'+i,x,y,w,foundation:Math.max(0,center-bottom)});}
 return sections;
}
export function makeHardscapeRenderer(T,{mat,geo,world,box,cylinder,scene,shadowOn}){
 const meshes=new Map(),geos=new Map([['box',box],['cylinder',cylinder]]),mats=new Map(),buckets=new Map();
 function geometry(shape){if(geos.has(shape))return geos.get(shape);let g;
 if(shape.startsWith('rock')){g=new T.IcosahedronGeometry(.5,1);const a=g.attributes.position,seed=Number(shape.slice(4))+1,lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),n=.83+.22*Math.sin(x*19.7+y*11.5+z*25.3+seed*3.7),v=[x*n+Math.sin(y*8+seed)*.045,Math.max(-.36,y*n)*.87,z*n+Math.cos(x*7+seed)*.04];for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],v[j]);hi[j]=Math.max(hi[j],v[j]);}a.setXYZ(i,...v);}for(let i=0;i<a.count;i++)a.setXYZ(i,...[a.getX(i),a.getY(i),a.getZ(i)].map((v,j)=>(v-lo[j])/(hi[j]-lo[j])-.5));g.computeVertexNormals();}
 else if(shape==='bowl'||shape==='pedestal'){const points=shape==='bowl'?[[0,0],[.28,0],[.34,.23],[.43,.57],[.5,.84],[.5,1],[.43,1],[.39,.74],[.29,.5],[0,.5]]:[[0,0],[.5,0],[.5,.12],[.29,.19],[.23,.43],[.32,.69],[.45,.85],[.45,1],[0,1]];g=new T.LatheGeometry(points.map(([x,y])=>new T.Vector2(x,y-.5)),24);}
 else if(shape==='roof'){const A=[-.5,-.5,-.5],B=[.5,-.5,-.5],C=[.5,-.5,.5],D=[-.5,-.5,.5],E=[-.5,.5,0],F=[.5,.5,0];g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([A,B,F,A,F,E,D,E,F,D,F,C,A,D,E,B,F,C,A,D,C,A,C,B].flat(),3));g.computeVertexNormals();}
 else g=new T.BoxGeometry(1,1,1);
 g=geo(g);geos.set(shape,g);return g;}
 let detailedParts=0,steppedCount=0;function add(original,detail){const sections=steppedSections(original,(x,y)=>world(x,y).y);if(sections.length>1)steppedCount++;for(const o of sections){let parts=hardParts(o,detail&&detailedParts<30000);if(detail&&detailedParts+parts.length>30000)parts=hardParts(o,false);detailedParts+=parts.length;for(const p of parts){const key=p.shape+'|'+p.color;let b=buckets.get(key);if(!b){b={shape:p.shape,color:p.color,items:[]};buckets.set(key,b);}const placed=localPlacement(o,p);if(o.foundation>0&&p.y-p.h/2<.025){placed.z-=o.foundation/2;placed.scale[1]+=o.foundation;}b.items.push({o,p:placed});}}}
 function finish(){const dummy=new T.Object3D();let count=0;for(const [key,b] of buckets){let material=mats.get(b.color);if(!material){material=mat(b.color,{flatShading:true,side:T.DoubleSide});mats.set(b.color,material);}const mesh=new T.InstancedMesh(geometry(b.shape),material,b.items.length);for(let i=0;i<b.items.length;i++){const {o,p}=b.items[i],base=world(o.x,o.y);dummy.position.set(base.x+p.x-o.x,base.y+p.z,base.z+p.y-o.y);dummy.rotation.set(0,p.angle,0);dummy.scale.set(...p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=shadowOn;mesh.receiveShadow=true;scene.add(mesh);meshes.set(key,mesh);count+=b.items.length;}buckets.clear();return count;}
 return {add,finish,get steppedCount(){return steppedCount;}};
}

// Original concept terrain utilities; coordinates and heights in feet.
function terrainGrid(width,depth,land,elevation){
 const detail=land.reduce((a,o)=>Math.min(a,Math.max(.5,Math.min(o.w,o.h)/6)),2);
 const nx=Math.min(140,Math.max(20,Math.ceil(width/detail))),ny=Math.min(140,Math.max(20,Math.ceil(depth/detail)));
 const dx=width/nx,dy=depth/ny,values=new Float64Array((nx+1)*(ny+1));
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)values[j*(nx+1)+i]=elevation(i*dx,j*dy);
 function at(x,y){if(x<0||y<0||x>width||y>depth)return elevation(x,y);
 const i=Math.min(nx-1,Math.floor(x/dx)),j=Math.min(ny-1,Math.floor(y/dy)),u=x/dx-i,v=y/dy-j,k=j*(nx+1)+i;
 const a=values[k],b=values[k+nx+1],c=values[k+nx+2],d=values[k+1];
 return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);}
 return {nx,ny,dx,dy,width,depth,at};
}

function clipHalf(poly,fn){if(!poly.length)return [];const out=[];let a=poly[poly.length-1],fa=fn(a);for(const b of poly){const fb=fn(b);if((fa>=0)!==(fb>=0)){const t=fa/(fa-fb);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}if(fb>=0)out.push(b);a=b;fa=fb;}return out;}

function drapeTriangles(points,tris,grid,limit=100000){
 const out=[];for(const ids of tris){const p=ids.map(i=>points[i]);const minX=Math.max(0,Math.floor(Math.min(...p.map(q=>q[0]))/grid.dx)),maxX=Math.min(grid.nx-1,Math.floor(Math.max(...p.map(q=>q[0]))/grid.dx)),minY=Math.max(0,Math.floor(Math.min(...p.map(q=>q[1]))/grid.dy)),maxY=Math.min(grid.ny-1,Math.floor(Math.max(...p.map(q=>q[1]))/grid.dy));
 for(let j=minY;j<=maxY;j++)for(let i=minX;i<=maxX;i++){const x=i*grid.dx,y=j*grid.dy;let cell=clipHalf(p,q=>q[0]-x);cell=clipHalf(cell,q=>x+grid.dx-q[0]);cell=clipHalf(cell,q=>q[1]-y);cell=clipHalf(cell,q=>y+grid.dy-q[1]);if(cell.length<3)continue;
 const diagonal=q=>1-(q[0]-x)/grid.dx-(q[1]-y)/grid.dy;
 for(const side of [1,-1]){const shape=clipHalf(cell,q=>side*diagonal(q));for(let k=1;k+1<shape.length;k++){const a=shape[0],b=shape[k],c=shape[k+1],area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<1e-10)continue;out.push([a,b,c]);if(out.length>limit)return null;}}}}
 return out;
}

function pondLevel(points,grid){let low=Infinity;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/Math.min(grid.dx,grid.dy)*2));for(let k=0;k<=n;k++){const t=k/n;low=Math.min(low,grid.at(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t));}}return low+.055;}

function creekStones(points,random,limit=180){
 let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-b[0]*a[1];}area=Math.abs(area)/2;
 const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
 const target=Math.min(limit,Math.ceil(area*.42)),out=[];
 for(let tries=0;tries<target*22&&out.length<target;tries++){const x=minX+(maxX-minX)*random(),y=minY+(maxY-minY)*random(),w=.2+.65*random(),d=w*(.65+.35*random());let inside=false,edge=Infinity;
 for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[j],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));edge=Math.min(edge,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}
 if(!inside||edge<w*.55||out.some(p=>Math.hypot(x-p.x,y-p.y)<(w+p.w)*.33))continue;
 out.push({x,y,w,d,h:w*(.22+.2*random()),angle:random()*Math.PI*2,tone:random()});}
 return out;
}
function basinModel(features,base){
 const basins=[],skipped=[];
 for(const f of features){
  if(!['pond','rain'].includes(f.feature)||!(f.basinDepth>0))continue;
  const points=f.points;
  if(basins.length>=40||points.length>512||points.length<3){skipped.push(f.id);continue;}
  const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
  const w=maxX-minX,h=maxY-minY;if(Math.min(w,h)<.05){skipped.push(f.id);continue;}
  let rim=Infinity;
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],n=Math.min(2048,Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.5)));for(let k=0;k<=n;k++){const t=k/n;rim=Math.min(rim,base(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t));}}
  const depth=f.basinDepth,bank=Math.min(4,Math.max(.25,Math.min(w,h)*.24)),level=rim-Math.min(.15,depth*.15),bottom=rim-depth;
  basins.push({id:f.id,points,minX,maxX,minY,maxY,w:bank*2,h:bank*2,bank,level,bottom});
 }
 function at(x,y){const original=base(x,y);let result=original;
  for(const b of basins){if(x<=b.minX||x>=b.maxX||y<=b.minY||y>=b.maxY)continue;
   let inside=false,edge=Infinity;const p=b.points;
   for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[j],c=p[i],dx=c[0]-a[0],dy=c[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));edge=Math.min(edge,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));if((a[1]>y)!==(c[1]>y)&&x<(c[0]-a[0])*(y-a[1])/(c[1]-a[1])+a[0])inside=!inside;}
   if(!inside)continue;const t=Math.min(1,edge/b.bank),s=t*t*(3-2*t);result=Math.min(result,original+(Math.min(original,b.bottom)-original)*s);
  }return result;
 }
 return {basins,skipped,at};
}

function wetFaces(faces,grid,level){
 const out=[];
 for(const face of faces){const p=clipHalf(face,q=>level-.012-grid.at(...q));for(let i=1;i+1<p.length;i++){const a=p[0],b=p[i],c=p[i+1];if(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))>1e-10)out.push([a,b,c]);}}
 return out;
}
export {terrainGrid,drapeTriangles,pondLevel,creekStones,basinModel,wetFaces};

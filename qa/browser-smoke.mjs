// Browser QA for the real editor and exported client HTML. No application test hooks.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const base = process.env.STUDIO_URL || 'http://127.0.0.1:8765/';
const dir = resolve(process.env.QA_OUTPUT || 'qa-results');
await mkdir(dir,{recursive:true});
const browser = await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
const storageKey='glassroot-studio-v1';
const project=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),storageKey);
const button=(p,id)=>p.locator('#'+id);
async function openDetails(p,id){await button(p,id).evaluate(el=>{el.open=true;});}
async function until(p,fn,arg,timeout=120000){await p.waitForFunction(fn,arg,{timeout});}
async function count(p,n){await until(p,n=>JSON.parse(localStorage.getItem('glassroot-studio-v1'))?.objects.filter(o=>o.type==='plant').length===n,n);}
async function waitText(p,id,re){await until(p,({id,source,flags})=>new RegExp(source,flags).test(document.getElementById(id)?.textContent||''),{id,source:re.source,flags:re.flags});}
async function start(p){await p.goto(base,{waitUntil:'domcontentloaded'});await button(p,'cv').waitFor({state:'visible'});await until(p,()=>document.getElementById('cv').width>100&&document.querySelectorAll('[data-plant-id]').length>100);}
async function clickWorld(p,x,y,width=100,depth=100){const box=await button(p,'cv').boundingBox();assert(box);const s=Math.max(.05,Math.min((box.width-60)/width,(box.height-60)/depth));await p.mouse.click(box.x+box.width/2+(x-width/2)*s,box.y+box.height/2+(y-depth/2)*s);}
async function load(p,m){await button(p,'file').setInputFiles({name:'qa.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(m))});await until(p,m=>{const saved=JSON.parse(localStorage.getItem('glassroot-studio-v1'));return saved?.width===m.width&&saved?.depth===m.depth&&saved?.objects.length===m.objects.length&&saved?.objects[0]?.id===m.objects[0]?.id;},m);}
async function download(p,selector,name){const event=p.waitForEvent('download',{timeout:120000});await p.locator(selector).click();const d=await event;const dest=resolve(dir,name);await d.saveAs(dest);assert.equal(await d.failure(),null);return dest;}
async function png(p,selector,name){const path=await download(p,selector,name);const b=await readFile(path);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(b.readUInt32BE(16)>100&&b.readUInt32BE(20)>100);return {width:b.readUInt32BE(16),height:b.readUInt32BE(20),bytes:b.length};}
async function ready3(p,n,status='studioStatus',host='studioHost'){
  await until(p,({status,host,n})=>{const s=document.getElementById(status)?.textContent||'';return !!document.querySelector('#'+host+' canvas')&&s.includes(n.toLocaleString('en-US')+' plants ·')&&s.includes('draw calls');},{status,host,n});
  const s=await button(p,status).innerText();
  const t=Number(s.match(/([\d,]+) plant triangles/)?.[1].replaceAll(',',''));
  assert(Number.isFinite(t)&&t>=0&&t<=1800000,'Plant triangle budget: '+s);
  assert(n===0||t>0,'Expected visible plant geometry');
  return {status:s,triangles:t};
}
async function enter3(p,n){const t=performance.now();await button(p,'viewStudio').click();const info=await ready3(p,n);return {...info,firstRenderMs:Math.round(performance.now()-t)};}
async function screenshot(p,name){await p.screenshot({path:resolve(dir,name+'.png'),timeout:120000});}
function fixture(name,n,width,depth){
  // Fixed IDs, dimensions, order and seed-like angles; concept sizes, not botanical prescriptions.
  const ids=['p0','p1','p2','p3','p4','p5','p6','p7','p8','p9'];
  const objects=[
    {id:name+'-house',type:'house',x:width*.08,y:depth*.06,w:width*.18,h:depth*.12,height:12},
    {id:name+'-path',type:'path',x:width*.3,y:depth*.06,w:5,h:depth*.88,height:0,material:'dg'},
    {id:name+'-bench',type:'hard',kind:'bench',x:width*.32,y:depth*.25,w:5,h:2,height:3,angle:25},
    {id:name+'-berm',type:'terrain',kind:'berm',x:width*.72,y:depth*.18,w:18,h:16,height:2},
    {id:name+'-pond',type:'bed',feature:'pond',basinDepth:1.5,smooth:true,points:[[width*.65,depth*.4],[width*.85,depth*.4],[width*.87,depth*.58],[width*.68,depth*.62]]},
    {id:name+'-rain',type:'bed',feature:'rain',basinDepth:.5,smooth:true,points:[[width*.05,depth*.7],[width*.23,depth*.68],[width*.24,depth*.9],[width*.06,depth*.92]]}
  ];
  const cols=Math.ceil(Math.sqrt(n*width/depth)),rows=Math.ceil(n/cols);
  for(let i=0;i<n;i++){const col=i%cols,row=Math.floor(i/cols),w=[2,3,3,4,3,4,5,7,12,4][i%10];objects.push({id:name+'-p'+i,type:'plant',species:ids[i%10],x:width*(.04+.92*(col+.5)/cols),y:depth*(.2+.75*(row+.5)/rows),w,h:w,height:[3,5,2,2,3,4,4,8,10,3][i%10],angle:i*137.5%360});}
  return {version:1,width,depth,grade:{x:1,y:-1},objects};
}
function capture(p,errors,diagnostics){
  p.on('pageerror',e=>errors.push('pageerror: '+e.message));
  p.on('console',m=>{const text=m.text();if(/shader error|VALIDATE_STATUS.*false|THREE\.WebGLProgram.*error|context lost/i.test(text))errors.push('WebGL: '+text);else if(m.type()==='error'||m.type()==='warning')diagnostics.push(m.type()+': '+text);});
  p.on('requestfailed',r=>diagnostics.push('request: '+r.url()+' '+r.failure()?.errorText));
  p.on('dialog',d=>{errors.push('Unexpected '+d.type()+': '+d.message());void d.dismiss();});
}
async function run(name,fn){
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true,locale:'en-US',reducedMotion:'no-preference'});
  context.setDefaultTimeout(120000);
  const errors=[],diagnostics=[],pages=[];
  context.on('page',p=>{pages.push(p);capture(p,errors,diagnostics);});
  const p=await context.newPage();
  const started=performance.now();
  const item={name,passed:false,errors,diagnostics};results.push(item);
  try{await start(p);item.metrics=await fn(p,context);assert.deepEqual(errors,[]);item.passed=true;}
  catch(e){item.failure=String(e.stack||e);for(const [i,q] of pages.entries())try{await screenshot(q,name+'-failure-'+i);}catch{}}
  finally{item.elapsedMs=Math.round(performance.now()-started);await context.close();await writeFile(resolve(dir,'results.json'),JSON.stringify(results,null,2));console.log((item.passed?'PASS ':'FAIL ')+name+' '+item.elapsedMs+' ms'+(item.failure?'\n'+item.failure:''));}
}
try{
await run('editor-roundtrip',async p=>{
  await button(p,'demo').click();await count(p,15);
  await p.locator('[data-tool="plant"]').click();await clickWorld(p,50,50);await count(p,16);
  await p.locator('[data-tool="select"]').click();await clickWorld(p,50,50);
  const field=p.locator('#selection .field').filter({hasText:'Rotation (degrees)'}).locator('input');
  await field.fill('45');await field.press('Tab');
  const plant=(await project(p)).objects.at(-1);assert.equal(plant.angle,45);
  const box=await button(p,'cv').boundingBox();const s=Math.min((box.width-60)/100,(box.height-60)/100);
  await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+8*s,box.y+box.height/2+4*s,{steps:5});await p.mouse.up();
  const moved=(await project(p)).objects.find(o=>o.id===plant.id);assert(Math.abs(moved.x-58)<=1&&Math.abs(moved.y-54)<=1);
  await p.locator('#selection').getByRole('button',{name:'Duplicate',exact:true}).click();await count(p,17);
  await p.locator('#selection').getByRole('button',{name:'Delete',exact:true}).click();await count(p,16);
  await button(p,'undo').click();await count(p,17);await button(p,'redo').click();await count(p,16);
  const saved=JSON.parse(await readFile(await download(p,'#save','roundtrip.json'),'utf8'));assert.equal(saved.objects.length,(await project(p)).objects.length);
  assert.match(await button(p,'fileStatus').innerText(),/Download requested: glass-root-project\.json/);
  await p.reload();await count(p,16);await load(p,saved);assert.deepEqual(await project(p),saved);
  await p.locator('.legacy-menu summary').click();await button(p,'view3').click();assert(await button(p,'view3').evaluate(e=>e.classList.contains('active')));
  await button(p,'view2').click();await screenshot(p,'editor-roundtrip');return {plants:16};
});
await run('rain-garden-mass-planting',async p=>{
  await p.locator('#toolsTerrain summary').click();await p.locator('[data-tool="water"]').click();await button(p,'waterKind').selectOption('rain');
  for(const [x,y] of [[20,20],[50,20],[50,50],[20,50]])await clickWorld(p,x,y);
  await button(p,'finish').click();const bed=(await project(p)).objects[0];assert.equal(bed.feature,'rain');assert.equal(bed.basinDepth,.5);
  await button(p,'massTool').click();await button(p,'massBed').selectOption(bed.id);await button(p,'massSpacing').fill('5');
  await button(p,'massPreview').click();await until(p,()=>!document.getElementById('massApply').disabled);
  await button(p,'massApply').click();const n=(await project(p)).objects.filter(o=>o.type==='plant').length;assert(n>0);await screenshot(p,'rain-garden-mass-planting');await button(p,'undo').click();await count(p,0);return {placed:n};
});
await run('residential-client',async(p,context)=>{
  const m=fixture('residential',60,100,100);
  const markers=['QA_PRIVATE_CLIENT_7X','QA_PRIVATE_SITE_7X','QA_PRIVATE_NOTES_7X'];
  m.report={ecology:true,title:'Synthetic proposal',client:markers[0],site:markers[1],notes:markers[2],brand:'Glass Root Garden',numbers:true,aerial:false,costs:true,mulch:3,labor:null,prices:{}};
  await load(p,m);assert.equal((await project(p)).report.client,markers[0]);const metrics=await enter3(p,60);
  await openDetails(p,'studioLightPanel');await button(p,'studioLightStyle').selectOption('evening');await button(p,'studioColorLook').selectOption('cinematic');
  await openDetails(p,'studioBackgroundPanel');await button(p,'studioBackgroundPreset').selectOption('hill');await button(p,'studioAnimate').check();await waitText(p,'studioStatus',/breeze animation|motion paused/);await button(p,'studioAnimate').uncheck();
  await ready3(p,60);await screenshot(p,'residential-orbit');
  await openDetails(p,'studioViewsPanel');await button(p,'studioViewName').fill('Entrance');await button(p,'studioViewSave').click();
  await button(p,'studioMode').selectOption('walk');await waitText(p,'studioStatus',/Walkthrough/);
  await button(p,'studioViewName').fill('Eye level');await button(p,'studioViewSave').click();assert.equal((await project(p)).views.length,2);
  await openDetails(p,'studioExportPanel');metrics.editorPNG=await png(p,'#studioPNG','residential-editor-export.png');
  await openDetails(p,'studioViewsPanel');await openDetails(p,'clientDownloadOptions');
  await button(p,'clientPresentationTitle').fill('Synthetic QA landscape');const path=await download(p,'#clientDownload','residential-client.html');
  const html=await readFile(path,'utf8');for(const marker of markers)assert(!html.includes(marker),'Private report field leaked: '+marker);
  metrics.privateMarkersExcluded=markers.length;
  const q=await context.newPage();await q.goto(pathToFileURL(path).href,{waitUntil:'domcontentloaded'});await ready3(q,60,'status','host');
  assert.equal(await button(q,'heading').innerText(),'Synthetic QA landscape');assert.equal(await q.locator('#tools,#selection,#save').count(),0);
  await button(q,'next').click();await waitText(q,'counter',/2 \/ 2/);await waitText(q,'status',/Walkthrough/);
  await button(q,'mode').click();await waitText(q,'status',/Three\.js/);
  await button(q,'performance').selectOption('fast');await button(q,'motion').check();await waitText(q,'status',/breeze animation|motion paused/);await button(q,'motion').uncheck();
  metrics.clientPNG=await png(q,'#png','residential-client-export.png');
  await button(q,'size').selectOption('1920');metrics.clientPNG1920=await png(q,'#png','residential-client-1920.png');assert.equal(Math.max(metrics.clientPNG1920.width,metrics.clientPNG1920.height),1920);await screenshot(q,'residential-client-view');return metrics;
});
await run('project-reframe',async p=>{
  const large=fixture('large-refit',8,660,660),small=fixture('small-refit',9,100,100),fractional=fixture('fractional-refit',10,Math.sqrt(43560),Math.sqrt(43560));
  async function camera(label){await openDetails(p,'studioViewsPanel');await button(p,'studioViewName').fill(label);await button(p,'studioViewSave').click();return (await project(p)).views.at(-1).camera;}
  await load(p,large);await enter3(p,8);const a=await camera('Large');
  await load(p,small);await ready3(p,9);const b=await camera('Small');
  assert(Math.abs(a.dist-660*1.85)<.001);assert(Math.abs(b.dist-185)<.001);assert.deepEqual(b.target,[0,0,0]);
  await screenshot(p,'project-reframe-small');
  await load(p,fractional);await ready3(p,10);const c=await camera('Fractional');
  assert.equal(await button(p,'area').textContent(),'208.71 × 208.71 ft');assert.equal((await project(p)).width,fractional.width);assert(Math.abs(c.dist-fractional.width*1.85)<.001);
  await button(p,'studioClose').click();await load(p,large);await enter3(p,8);const d=await camera('Reopen large');assert(Math.abs(d.dist-a.dist)<.001);
  return {largeDistance:a.dist,smallDistance:b.dist,fractionalDistance:c.dist,reopenDistance:d.dist};
});
for(const [name,n,w,h] of [['one-acre',1000,220,198],['restoration',5000,660,660],...(process.env.QA_STRESS==='1'?[['stress',19990,1320,660]]:[])]){
  await run(name,async p=>{await load(p,fixture(name,n,w,h));const metrics=await enter3(p,n);await button(p,'studioMode').selectOption('walk');await waitText(p,'studioStatus',/Walkthrough/);metrics.walk=await ready3(p,n);await screenshot(p,name+'-walk');await button(p,'studioMode').selectOption('orbit');await waitText(p,'studioStatus',/Three\.js/);metrics.orbit=await ready3(p,n);await screenshot(p,name+'-orbit');return metrics;});
}
}finally{await browser.close();await writeFile(resolve(dir,'results.json'),JSON.stringify(results,null,2));}
if(results.some(r=>!r.passed))process.exitCode=1;

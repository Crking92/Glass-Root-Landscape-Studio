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
  await p.locator('[data-tool="plant"]').click();await button(p,'catalogCurrent').click();await clickWorld(p,50,50);await count(p,16);
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
await run('garden-features-and-workspace',async(p,context)=>{
  const kinds=['trellis','rainbarrel','compostbin','nestbox','gardensign'];
  await button(p,'tab-plants').click();await openDetails(p,'advancedPlants');
  await button(p,'filterWater').selectOption('Low');const exact=await p.locator('[data-plant-id]').count();
  await button(p,'filterWater').selectOption('group:low');const broad=await p.locator('[data-plant-id]').count();assert(broad>exact&&exact>0);
  await button(p,'filterWater').selectOption('group:unknown');assert(await p.locator('[data-plant-id]').count()>0);
  await button(p,'clearFilters').click();assert.equal(await p.locator('[data-plant-id]').count(),359);
  await button(p,'tab-hard').click();assert.equal(await p.locator('#hardscapeType option').count(),37);
  for(const [i,k] of kinds.entries()){
    await button(p,'tab-hard').click();await button(p,'hardscapeType').selectOption(k);await button(p,'placeHardscape').click();await clickWorld(p,25+i*12,50);
    const saved=await project(p);assert.equal(saved.objects.at(-1).kind,k);
  }
  await p.locator('[data-tool="select"]').click();await clickWorld(p,73,50);
  const angle=p.locator('#selection .field').filter({hasText:'Rotation (degrees)'}).locator('input');
  await angle.fill('35');await angle.press('Tab');assert.equal((await project(p)).objects.at(-1).angle,35);
  const m=await project(p);const saved=JSON.parse(await readFile(await download(p,'#save','garden-features.json'),'utf8'));assert.deepEqual(saved,m);
  await load(p,saved);await button(p,'tab-qty').click();assert.match(await button(p,'hardCounts').textContent(),/Interpretive garden sign: 1 ea/);
  await p.setViewportSize({width:850,height:900});const before=(await button(p,'cv').boundingBox()).width;
  await button(p,'toggleTools').click();await button(p,'toggleWorkspace').click();
  await until(p,before=>document.getElementById('cv').getBoundingClientRect().width>before+100,before);
  assert.equal(await button(p,'toggleTools').getAttribute('aria-expanded'),'false');assert.equal(await button(p,'toggleWorkspace').getAttribute('aria-expanded'),'false');
  await screenshot(p,'garden-workspace-expanded');
  await button(p,'toggleTools').click();await button(p,'toggleWorkspace').click();await p.setViewportSize({width:1440,height:1000});
  await enter3(p,0);await waitText(p,'studioStatus',/5 hardscape \/ [0-9]+ parts/);
  const status=await button(p,'studioStatus').textContent();assert(Number(status.match(/5 hardscape \/ ([0-9]+) parts/)[1])>25);
  await screenshot(p,'garden-features-3d');await openDetails(p,'studioViewsPanel');await openDetails(p,'clientDownloadOptions');const file=await download(p,'#clientDownload','garden-features-client.html');
  const q=await context.newPage();await q.goto(pathToFileURL(file).href,{waitUntil:'domcontentloaded'});await ready3(q,0,'status','host');await waitText(q,'status',/5 hardscape \/ [0-9]+ parts/);
  const clientStatus=await button(q,'status').textContent();assert(Number(clientStatus.match(/5 hardscape \/ ([0-9]+) parts/)[1])>25);
  await screenshot(q,'garden-features-client');return {exact,broad,status,clientStatus};
});
await run('customizable-shade-structures',async(p,context)=>{
  for(const [i,k] of ['pergola','pavilion','gazebo','shadesail'].entries()){
    await button(p,'tab-hard').click();await button(p,'hardscapeType').selectOption(k);await button(p,'placeHardscape').click();await clickWorld(p,22+i*18,50);
    await p.locator('[data-tool="select"]').click();await clickWorld(p,22+i*18,50);
    assert.equal((await project(p)).objects.at(-1).kind,k);
    await p.getByLabel('Frame finish',{exact:true}).selectOption('steel');
    if(k==='pergola'||k==='pavilion'){await p.getByLabel('Roof style',{exact:true}).selectOption('hip');await p.getByLabel('Post count',{exact:true}).selectOption('6');}
    await p.getByLabel('Roof color',{exact:true}).selectOption('green');
    await p.getByLabel('Post width (ft)',{exact:true}).fill('0.75');await p.getByLabel('Post width (ft)',{exact:true}).press('Tab');
    await p.getByLabel('Raised platform',{exact:true}).check();
    if(k==='gazebo')await p.getByLabel('Perimeter railing',{exact:true}).uncheck();
    const o=(await project(p)).objects.at(-1);assert.equal(o.shade.frame,'steel');assert.equal(o.shade.cover,'green');assert.equal(o.shade.postSize,.75);assert.equal(o.shade.deck,true);
  }
  const m=await project(p);const saved=JSON.parse(await readFile(await download(p,'#save','shade-structures.json'),'utf8'));assert.deepEqual(saved,m);await load(p,saved);
  await screenshot(p,'shade-structures-plan');await enter3(p,0);await waitText(p,'studioStatus',/4 hardscape \/ [0-9]+ parts/);
  const status=await button(p,'studioStatus').textContent();assert(Number(status.match(/4 hardscape \/ ([0-9]+) parts/)[1])>30);
  await screenshot(p,'shade-structures-3d');await openDetails(p,'studioViewsPanel');await openDetails(p,'clientDownloadOptions');const file=await download(p,'#clientDownload','shade-structures-client.html');
  const q=await context.newPage();await q.goto(pathToFileURL(file).href,{waitUntil:'domcontentloaded'});await ready3(q,0,'status','host');await waitText(q,'status',/4 hardscape \/ [0-9]+ parts/);
  const payload=JSON.parse(await q.locator('#payload').textContent());assert.deepEqual(payload.project.objects.map(o=>o.shade),m.objects.map(o=>o.shade));
  await screenshot(q,'shade-structures-client');return {status,clientStatus:await button(q,'status').textContent()};
});
await run('illustrated-plan-styles',async p=>{
  await button(p,'demo').click();await count(p,15);const original=await project(p);
  assert(await p.evaluate(()=>!!window.PlanGraphics));
  const images=[];
  for(const mode of ['technical','illustrated','presentation']){
    await button(p,'planStyle').selectOption(mode);await p.mouse.move(1,1);
    const path=await download(p,'#export','plan-'+mode+'.png'),bytes=await readFile(path);
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert(bytes.readUInt32BE(16)>100&&bytes.readUInt32BE(20)>100);
    assert.deepEqual(await project(p),original);
    images.push(bytes);await screenshot(p,'plan-'+mode);
  }
  assert(!images[0].equals(images[1])&&!images[1].equals(images[2]));
  // Changing only display mode cannot alter quantities, project history or persisted geometry.
  const presentation=await button(p,'cv').evaluate(c=>c.toDataURL());
  await button(p,'planStyle').selectOption('technical');await button(p,'planStyle').selectOption('presentation');
  assert.equal(await button(p,'cv').evaluate(c=>c.toDataURL()),presentation,'Plan graphics must redraw deterministically');
  await button(p,'seasonMonth').selectOption('0');const winter=await button(p,'cv').evaluate(c=>c.toDataURL());
  assert.notEqual(winter,presentation,'Seasonal plan appearance should change pixels');
  await button(p,'seasonMonth').selectOption('-1');assert.deepEqual(await project(p),original);
  await p.reload();await count(p,15);assert.equal(await button(p,'planStyle').inputValue(),'presentation');
  await button(p,'tab-qty').click();const totals=await button(p,'counts').textContent();
  await button(p,'planStyle').selectOption('technical');assert.equal(await button(p,'counts').textContent(),totals);
  await button(p,'planStyle').selectOption('illustrated');
  await p.locator('[data-tool="plant"]').click();await button(p,'catalogCurrent').click();await clickWorld(p,50,50);await count(p,16);
  await p.locator('[data-tool="select"]').click();await clickWorld(p,50,50);
  const obj=(await project(p)).objects.at(-1),box=await button(p,'cv').boundingBox(),scale=Math.min((box.width-60)/100,(box.height-60)/100);
  await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+5*scale,box.y+box.height/2+3*scale,{steps:5});await p.mouse.up();
  const moved=(await project(p)).objects.find(o=>o.id===obj.id);assert(Math.abs(moved.x-55)<=1&&Math.abs(moved.y-53)<=1);
  await button(p,'undo').click();await button(p,'undo').click();await count(p,15);assert.deepEqual(await project(p),original);
  const large=fixture('plan-large',5000,660,660);await load(p,large);await count(p,5000);await button(p,'planStyle').selectOption('presentation');await screenshot(p,'plan-large-presentation');
  return {styles:3,originalPlants:15,largePlants:5000,pngBytes:images.map(b=>b.length)};
});
await run('plan-grid-and-annotations',async p=>{
 await button(p,'demo').click();await count(p,15);const original=await project(p);
 assert.match(await button(p,'gridSize').innerText(),/5 × 5 ft · 25 sq ft/);
 await openDetails(p,'siteProperty');await button(p,'grid').uncheck();assert.equal(await button(p,'gridSize').innerText(),'Grid: off');await button(p,'grid').check();
 const before=await button(p,'cv').evaluate(c=>c.toDataURL());
 await openDetails(p,'planAnnotations');await button(p,'planLabels').selectOption('number');await button(p,'planLegend').check();await button(p,'planDimensions').check();
 assert.match(await button(p,'annotationStatus').textContent(),/\d+ of 15 visible plants labeled/);
 const after=await button(p,'cv').evaluate(c=>c.toDataURL());assert.notEqual(after,before);assert.deepEqual(await project(p),original);
 await button(p,'openPlantKey').click();const rows=await p.locator('#planKeyRows .plan-key-row').allTextContents();assert.equal(rows.length,new Set(original.objects.filter(o=>o.type==='plant').map(o=>o.species)).size);
 assert.equal(rows.reduce((n,row)=>n+Number(row.match(/× (\d+)/)[1]),0),15);
 await screenshot(p,'plan-numbered-key');await png(p,'#export','plan-annotated.png');assert.deepEqual(await project(p),original);
 await openDetails(p,'planAnnotations');await button(p,'planLabels').selectOption('scientific');await button(p,'planLabels').selectOption('common');await button(p,'planLabels').selectOption('none');await button(p,'planLegend').uncheck();await button(p,'planDimensions').uncheck();assert.deepEqual(await project(p),original);
 return {plants:15,species:rows.length,gridFeet:5};
});
await run('grid-spacing-and-saved-drafting',async p=>{
 await button(p,'demo').click();await count(p,15);const original=await project(p);
 await button(p,'gridToggle').click();assert.equal(await button(p,'gridToggle').getAttribute('aria-pressed'),'false');assert.equal(await button(p,'gridSize').innerText(),'Grid: off');
 await button(p,'gridToggle').click();await button(p,'gridSpacing').selectOption('10');assert.match(await button(p,'gridSize').innerText(),/10 × 10 ft · 100 sq ft/);
 await button(p,'gridSpacing').selectOption('2');assert.match(await button(p,'gridSize').innerText(),/2 × 2 ft · 4 sq ft/);
 assert.deepEqual(await project(p),original);await p.reload();await count(p,15);assert.equal(await button(p,'gridSpacing').inputValue(),'2');
 await openDetails(p,'planAnnotations');await button(p,'addDimension').click();await clickWorld(p,20,25);await clickWorld(p,40,25);
 assert.equal((await project(p)).draftNotes[0].kind,'dimension');assert.equal(Math.hypot(...(await project(p)).draftNotes[0].b.map((v,i)=>v-[20,25][i])),20);
 await openDetails(p,'planAnnotations');await button(p,'draftText').fill('Rain garden');await button(p,'addNote').click();await clickWorld(p,30,40);
 await openDetails(p,'planAnnotations');await button(p,'draftText').fill('Entrance');await button(p,'addCallout').click();await clickWorld(p,55,60);await clickWorld(p,65,70);
 const m=await project(p);assert.equal(m.draftNotes.length,3);assert.deepEqual(m.objects,original.objects);
 await openDetails(p,'planAnnotations');const on=await button(p,'cv').evaluate(c=>c.toDataURL());await button(p,'showDraftNotes').uncheck();assert.notEqual(await button(p,'cv').evaluate(c=>c.toDataURL()),on);await button(p,'showDraftNotes').check();await button(p,'planAnnotations').evaluate(e=>e.open=false);
 await png(p,'#export','saved-drafting.png');const saved=JSON.parse(await readFile(await download(p,'#save','saved-drafting.json'),'utf8'));assert.deepEqual(saved,m);
 await p.reload();await count(p,15);assert.deepEqual(await project(p),m);
 await openDetails(p,'planAnnotations');await p.getByRole('button',{name:'Remove Entrance',exact:true}).click();assert.equal((await project(p)).draftNotes.length,2);await button(p,'planAnnotations').evaluate(e=>e.open=false);await button(p,'undo').click();assert.equal((await project(p)).draftNotes.length,3);
 return {savedNotes:3,gridSpacing:2};
});
await run('presentation-sheets',async p=>{
 await button(p,'demo').click();await count(p,15);
 const m=await project(p);m.draftNotes=[{id:'dimension-qa',kind:'dimension',a:[20,20],b:[40,20]},{id:'note-qa',kind:'note',a:[40,40],text:'QA Rain garden'}];await load(p,m);
 await button(p,'reportOpen').click();await button(p,'reportTitle').fill('QA native garden');await button(p,'reportBrand').fill('QA design studio');await button(p,'reportPlanStyle').selectOption('presentation');await button(p,'reportPaper').selectOption('tabloid');await button(p,'reportSheetGrid').check();
 const image=p.locator('#reportSheet .sheet-plan-image');await image.waitFor();const first=await image.getAttribute('src');assert(first.startsWith('data:image/png;base64,'));assert.equal(await button(p,'reportSheet').getAttribute('data-paper'),'tabloid');assert.match(await button(p,'reportSheet').innerText(),/Total plants: 15/);
 await button(p,'reportSheetNotes').uncheck();assert.notEqual(await image.getAttribute('src'),first);await button(p,'reportSheetNotes').check();assert.equal(await image.getAttribute('src'),first);
 await button(p,'reportPlanStyle').selectOption('technical');assert.notEqual(await image.getAttribute('src'),first);await button(p,'reportPlanStyle').selectOption('presentation');
 await button(p,'reportSave').click();const saved=await project(p);assert.deepEqual(saved.objects,m.objects);assert.deepEqual(saved.draftNotes,m.draftNotes);assert.equal(saved.report.planStyle,'presentation');assert.equal(saved.report.paper,'tabloid');
 const pngInfo=await png(p,'#reportPlanPNG','professional-plan.png');assert.equal(pngInfo.width,2700);
 await screenshot(p,'presentation-sheet');await p.evaluate(()=>document.body.classList.add('print-report'));const pdf=await p.pdf({preferCSSPageSize:true,printBackground:true,path:resolve(dir,'presentation-sheet.pdf')});assert(pdf.subarray(0,5).toString()==='%PDF-');assert(pdf.length>1000);await p.evaluate(()=>document.body.classList.remove('print-report'));
 await button(p,'reportClose').click();await p.reload();await count(p,15);await button(p,'reportOpen').click();assert.equal(await button(p,'reportPaper').inputValue(),'tabloid');assert.equal(await button(p,'reportPlanStyle').inputValue(),'presentation');assert.equal(await button(p,'reportTitle').inputValue(),'QA native garden');
 return {png:pngInfo,pdfBytes:pdf.length,plants:15};
});
await run('studio-direct-object-selection',async p=>{
 const m={version:1,width:100,depth:100,objects:[
 {id:'large',type:'plant',species:'p7',x:20,y:20,w:16,h:16,height:18,angle:0},
 {id:'small',type:'plant',species:'p0',x:52,y:55,w:3,h:3,height:3,angle:0},
 {id:'forb',type:'plant',species:'p2',x:72,y:26,w:2,h:2,height:2,angle:0},
 {id:'bench',type:'hard',kind:'bench',x:75,y:75,w:6,h:3,height:3,angle:25},
 {id:'house',type:'house',x:16,y:68,w:12,h:10,height:10}
 ]};await load(p,m);await enter3(p,3);
 await openDetails(p,'studioViewsPanel');await button(p,'studioViewName').fill('QA camera');await button(p,'studioViewSave').click();const camera=(await project(p)).views.at(-1).camera;
 await button(p,'studioViewsPanel').evaluate(e=>e.open=false);
 async function screen(x,y,z){const b=await p.locator('#studioHost canvas').boundingBox(),{az,el,dist,target}=camera;
 const pos=[target[0]+dist*Math.cos(el)*Math.sin(az),target[1]+dist*Math.sin(el),target[2]+dist*Math.cos(el)*Math.cos(az)],v=[x-50-pos[0],z-pos[1],y-50-pos[2]],right=[Math.cos(az),0,-Math.sin(az)],up=[-Math.sin(el)*Math.sin(az),Math.cos(el),-Math.sin(el)*Math.cos(az)],forward=[-Math.cos(el)*Math.sin(az),-Math.sin(el),-Math.cos(el)*Math.cos(az)],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),f=b.height/(2*Math.tan(43*Math.PI/360)),d=dot(v,forward);return [b.x+b.width/2+dot(v,right)*f/d,b.y+b.height/2-dot(v,up)*f/d];}
 await button(p,'studioMode').selectOption('select');
 for(const [id,x,y,z] of [['small',52,55,1.5],['forb',72,26,1],['large',20,20,9],['bench',75,75,1.5],['house',22,73,5]]){await p.mouse.click(...await screen(x,y,z));assert.equal(await button(p,'studioPlantPick').inputValue(),id,'Click must select '+id);}
 await p.mouse.click(...await screen(52,55,1.5));await button(p,'studioMode').selectOption('move');await p.mouse.click(...await screen(62,65,0));assert.deepEqual((await project(p)).objects.find(o=>o.id==='small'),{...m.objects[1],x:62,y:65});
 await button(p,'studioMode').selectOption('select');await p.mouse.click(...await screen(75,75,1.5));assert.equal(await button(p,'studioPlantPick').inputValue(),'bench');await button(p,'studioMode').selectOption('move');await p.mouse.click(...await screen(85,85,0));await ready3(p,3);assert.equal((await project(p)).objects.find(o=>o.id==='bench').x,85);assert.equal((await project(p)).objects.find(o=>o.id==='bench').y,85);
 await screenshot(p,'studio-direct-selection');return {directSelections:5,moved:2};
});
await run('plant-catalog-and-live-drag',async p=>{
 await p.locator('[data-tool="plant"]').click();await button(p,'plantCatalog').waitFor({state:'visible'});assert.equal(await p.locator('[data-catalog-id]').count(),315);
 await button(p,'catalogProvisional').check();assert.equal(await p.locator('[data-catalog-id]').count(),359);await button(p,'catalogProvisional').uncheck();
 await button(p,'catalogSort').selectOption('scientific');const names=await p.locator('.catalog-tile strong').allTextContents();assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
 await button(p,'catalogSearch').fill('Muhlenbergia lindheimeri');const tile=p.locator('[data-catalog-id="p1"]');await tile.waitFor();await until(p,()=>{const c=document.querySelector('[data-catalog-thumb="p1"]');return c&&c.getContext('2d').getImageData(64,64,1,1).data[3]>0;});await p.locator('[data-preview-id="p1"]').click();await waitText(p,'catalogPreviewStatus',/Dedicated species geometry.*triangles/);assert(await p.locator('#catalogPreviewHost canvas').isVisible());const original=await project(p);await button(p,'catalogRotateRight').click();await button(p,'catalogZoomIn').click();await button(p,'catalogPreviewReset').click();await screenshot(p,'catalog-3d-preview');assert.deepEqual(await project(p),original);
 await button(p,'catalogSearch').fill('Schizachyrium scoparium');await p.locator('[data-preview-id="p0"]').click();await waitText(p,'catalogPreviewStatus',/Production growth-form geometry.*triangles/);assert.equal(await p.locator('#catalogPreviewHost canvas').count(),1);await button(p,'catalogSearch').fill('Muhlenbergia lindheimeri');await p.locator('[data-preview-id="p1"]').click();await waitText(p,'catalogPreviewStatus',/Dedicated species geometry.*triangles/);await button(p,'catalogPreviewUse').click();assert(!(await button(p,'plantCatalog').isVisible()));await until(p,()=>!document.querySelector('#catalogPreviewHost canvas'));await clickWorld(p,50,50);await count(p,1);
 await enter3(p,1);await button(p,'studioMode').selectOption('place');await button(p,'plantCatalog').waitFor({state:'visible'});await button(p,'catalogCurrent').click();await button(p,'studioMode').selectOption('select');
 await openDetails(p,'studioViewsPanel');await button(p,'studioViewName').fill('QA drag camera');await button(p,'studioViewSave').click();const camera=(await project(p)).views.at(-1).camera;await button(p,'studioViewsPanel').evaluate(e=>e.open=false);
 const canvas=p.locator('#studioHost canvas');const b=await canvas.boundingBox(),{az,el,dist,target}=camera,screen=(x,y,z)=>{const pos=[target[0]+dist*Math.cos(el)*Math.sin(az),target[1]+dist*Math.sin(el),target[2]+dist*Math.cos(el)*Math.cos(az)],v=[x-50-pos[0],z-pos[1],y-50-pos[2]],right=[Math.cos(az),0,-Math.sin(az)],up=[-Math.sin(el)*Math.sin(az),Math.cos(el),-Math.sin(el)*Math.cos(az)],forward=[-Math.cos(el)*Math.sin(az),-Math.sin(el),-Math.cos(el)*Math.cos(az)],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),f=b.height/(2*Math.tan(43*Math.PI/360)),d=dot(v,forward);return [b.x+b.width/2+dot(v,right)*f/d,b.y+b.height/2-dot(v,up)*f/d];};
 const o=(await project(p)).objects[0],start=screen(50,50,o.height*.5),end=screen(65,60,o.height*.5);await p.mouse.move(...start);await p.mouse.down();await p.mouse.move(...end,{steps:6});assert.equal((await project(p)).objects[0].x,50);await screenshot(p,'live-plant-drag');await p.mouse.up();await until(p,()=>JSON.parse(localStorage.getItem('glassroot-studio-v1')).objects[0].x!==50);assert(await canvas.isVisible());await screenshot(p,'plant-catalog-drag-committed');return {approved:315,includingProvisional:359};
});
await run('attached-landscape-edging',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'edged-bed',type:'bed',points:[[10,10],[40,10],[40,30],[10,30]],material:'mulch'},{id:'edged-path',type:'path',x:55,y:20,w:8,h:50,height:0,material:'dg'}]};await load(p,m);
 await clickWorld(p,25,20);await p.locator('#selection details').filter({hasText:'Landscape edging'}).locator('summary').click();await button(p,'edgeMaterial').selectOption('limestone');await button(p,'edge-height').fill('.5');await button(p,'edge-height').press('Tab');
 assert.equal((await project(p)).objects[0].edging.height,.5);assert.equal((await project(p)).objects[0].edging.kind,'limestone');
 await clickWorld(p,59,40);await p.locator('#selection details').filter({hasText:'Landscape edging'}).locator('summary').click();await button(p,'edgeMaterial').selectOption('steel');
 const saved=await project(p);assert.equal(saved.objects[1].edging.kind,'steel');await button(p,'tab-qty').click();assert.match(await button(p,'hardCounts').innerText(),/Limestone edging: 100.0 linear ft/);assert.match(await button(p,'hardCounts').innerText(),/Steel edging: 116.0 linear ft/);
 await png(p,'#export','edging-plan.png');await button(p,'reportOpen').click();assert.match(await button(p,'reportSheet').innerText(),/Limestone edging/);await button(p,'reportClose').click();
 await enter3(p,0);await waitText(p,'studioStatus',/edging parts/);await screenshot(p,'edging-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);await clickWorld(p,59,40);await button(p,'edgeMaterial').selectOption('');assert.equal((await project(p)).objects[1].edging,undefined);await button(p,'undo').click();assert.equal((await project(p)).objects[1].edging.kind,'steel');return {attachedBorders:2,linearFeet:216};
});
await run('natural-stone-details',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'limestone',type:'hard',kind:'limestoneblock',x:20,y:25,w:5,h:2,height:1.5,angle:15},{id:'sandstone',type:'hard',kind:'sandstonewall',x:50,y:50,w:20,h:1.5,height:3,angle:0},{id:'border',type:'hard',kind:'limestoneborder',x:65,y:75,w:25,h:.65,height:.42,angle:15},{id:'edged',type:'bed',points:[[10,60],[30,60],[30,80],[10,80]],edging:{kind:'sandstone',width:.65,height:.42,piece:1.1}}]};await load(p,m);await clickWorld(p,50,50);await button(p,'stoneFinish').selectOption('sawn');await button(p,'stone-piece').fill('2');await button(p,'stone-piece').press('Tab');await button(p,'stone-course').fill('.75');await button(p,'stone-course').press('Tab');await button(p,'stoneCap').uncheck();await button(p,'stoneLayout').selectOption('irregular');const saved=await project(p);assert.deepEqual(saved.objects[1].stone,{finish:'sawn',piece:2,course:.75,cap:false,layout:'irregular'});await png(p,'#export','natural-stone-plan.png');await enter3(p,0);await waitText(p,'studioStatus',/edging parts/);await screenshot(p,'natural-stone-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);await button(p,'reportOpen').click();assert.match(await button(p,'reportSheet').innerText(),/Stacked sandstone wall/);return {stoneObjects:3,attachedSandstone:true};
});
await run('stone-slabs-and-material-finishes',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'slab',type:'hard',kind:'limestoneslab',x:25,y:25,w:7,h:2.5,height:.4,angle:12},{id:'sand',type:'hard',kind:'sandstoneslab',x:70,y:25,w:5,h:3,height:.35,angle:25},...['corten','blacksteel','agedbrick','timber'].map((kind,j)=>({id:kind,type:'bed',points:[[5+j*23,60],[22+j*23,60],[22+j*23,78],[5+j*23,78]],edging:{kind,width:.35,height:.25,piece:1}}))]};await load(p,m);await clickWorld(p,25,25);await button(p,'stoneFinish').selectOption('sawn');assert.equal((await project(p)).objects[0].stone.finish,'sawn');assert.equal(await button(p,'stone-piece').count(),0);await png(p,'#export','stone-finishes-plan.png');await enter3(p,0);await waitText(p,'studioStatus',/edging parts/);await screenshot(p,'stone-finishes-3d');await button(p,'studioClose').click();await p.reload();assert.equal((await project(p)).objects[0].stone.finish,'sawn');return {slabs:2,finishes:4};
});
await run('fitted-fieldstone-and-flagstone',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'rock',type:'hard',kind:'fieldstone',x:15,y:15,w:4,h:3,height:1.4,angle:12},{id:'paving',type:'hard',kind:'flagstonepaving',x:45,y:30,w:30,h:5,height:.16,angle:0},{id:'wall',type:'hard',kind:'fieldstonewall',x:55,y:55,w:24,h:1.4,height:3,angle:0},{id:'border',type:'hard',kind:'fieldstoneborder',x:40,y:75,w:22,h:1,height:.65,angle:0},{id:'edged',type:'bed',points:[[75,65],[92,65],[92,85],[75,85]],edging:{kind:'fieldlimestone',width:.85,height:.55,piece:1.1}}]};await load(p,m);await clickWorld(p,45,30);await button(p,'fieldMaterial').selectOption('sandstone');await button(p,'field-gap').fill('.08');await button(p,'field-gap').press('Tab');assert.equal((await project(p)).objects[1].stone.gap,.08);await clickWorld(p,55,55);await button(p,'field-course').fill('.7');await button(p,'field-course').press('Tab');assert.equal((await project(p)).objects[2].stone.course,.7);const saved=await project(p);await png(p,'#export','fieldstone-plan.png');await enter3(p,0);await waitText(p,'studioStatus',/irregular stone pieces/);await waitText(p,'studioStatus',/edging parts/);await screenshot(p,'fieldstone-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);await button(p,'reportOpen').click();assert.match(await button(p,'reportSheet').innerText(),/Fitted irregular flagstone/);return {objects:5};
});
await run('visual-material-catalog',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'material-bed',type:'bed',points:[[10,10],[40,10],[40,40],[10,40]],material:'mulch',edging:{kind:'limestone',width:.9,height:.55,piece:1.2}}]};await load(p,m);await clickWorld(p,20,20);await button(p,'browseSelectedSurface').click();assert.equal(await p.locator('#materialCatalogGrid [data-material-key]').count(),6);await p.waitForFunction(()=>{const c=document.querySelector('#materialCatalogGrid [data-material-key="gravel"] canvas');return c&&c.getContext('2d').getImageData(40,40,1,1).data[3]>0;});await p.locator('#materialCatalogGrid [data-material-key="gravel"]').click();assert.equal((await project(p)).objects[0].material,'gravel');await button(p,'browseEdging').click();assert.equal(await p.locator('#materialCatalogGrid [data-material-key]').count(),15);await p.locator('#materialCatalogGrid [data-material-key="limestone"]').click();assert.equal((await project(p)).objects[0].edging.width,.9);await button(p,'browseEdging').click();await button(p,'materialCatalogSearch').fill('stacked sandstone');assert.equal(await p.locator('#materialCatalogGrid [data-material-key]').count(),1);await p.locator('#materialCatalogGrid [data-material-key="stacksandstone"]').click();assert.equal((await project(p)).objects[0].edging.kind,'stacksandstone');await button(p,'browsePaving').click();assert.equal(await p.locator('#materialCatalogGrid [data-material-key]').count(),5);await p.locator('#materialCatalogGrid [data-material-key="mixed"]').click();const saved=await project(p);assert.equal(saved.objects[0].paving.kind,'mixed');await button(p,'browsePaving').click();await button(p,'materialCatalogClose').click();assert.deepEqual((await project(p)).objects,saved.objects);await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);return {surface:6,edging:14,paving:4};
});
await run('tight-natural-paving-coverage',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'tight',type:'path',x:15,y:15,w:22,h:7,material:'mulch',paving:{kind:'mixed',material:'limestone',piece:1.7,gap:.22,irregularity:.65}}]};await load(p,m);await clickWorld(p,25,18);await button(p,'pavingTight').click();const saved=await project(p);assert.equal(saved.objects[0].paving.gap,.06);const coverage=await p.evaluate(o=>{const P=window.StudioPaving,pts=P.outline(o,v=>v.points),a=P.pieces(o,pts);return a.reduce((n,c)=>n+Math.abs(P.area(c.poly)),0)/Math.abs(P.area(pts));},saved.objects[0]);assert(coverage>.82);await enter3(p,0);await waitText(p,'studioStatus',/irregular stone pieces/);await screenshot(p,'tight-natural-paving');await button(p,'studioClose').click();await p.reload();assert.equal((await project(p)).objects[0].paving.gap,.06);return {coverage};
});
await run('natural-paving-and-hardscape-catalog',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'patio',type:'path',x:10,y:10,w:20,h:10,material:'dg'},{id:'curve',type:'bed',walkway:true,points:[[40,10],[55,10],[65,20],[65,35],[59,35],[59,23],[52,16],[40,16]],material:'soil'}]};await load(p,m);await clickWorld(p,20,15);await button(p,'pavingStyle').selectOption('fitted');await button(p,'pavingMaterial').selectOption('sandstone');await clickWorld(p,49,13);await button(p,'pavingStyle').selectOption('stepping');await button(p,'paving-gap').fill('.8');await button(p,'paving-gap').press('Tab');const saved=await project(p);assert.equal(saved.objects[1].paving.gap,.8);
 const stats=await p.evaluate(m=>{const P=window.StudioPaving;return m.objects.map(o=>{const pts=P.outline(o,v=>v.points),a=P.pieces(o,pts);return {count:a.length,deterministic:JSON.stringify(a)===JSON.stringify(P.pieces(o,pts)),inside:a.every(c=>c.poly.every(v=>P.inside(v,pts)))};});},saved);assert(stats.every(a=>a.count>0&&a.deterministic&&a.inside));
 await button(p,'tab-hard').click();await button(p,'openHardCatalog').click();await p.waitForFunction(()=>{const c=document.querySelector('[data-hard-catalog-id="bench"] canvas');return c&&c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v!==0);});await button(p,'hardCatalogSearch').fill('bench');await p.locator('[data-hard-catalog-id="bench"]').click();assert.equal(await button(p,'hardscapeType').inputValue(),'bench');await clickWorld(p,80,80);await png(p,'#export','natural-paving-plan.png');await enter3(p,0);await waitText(p,'studioStatus',/irregular stone pieces/);await screenshot(p,'natural-paving-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects.slice(0,2),saved.objects);return stats;
});
await run('buried-slab-and-natural-outcrop',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'slab',type:'hard',kind:'buriedslab',x:20,y:25,w:8,h:5,height:1.4,angle:20},{id:'outcrop',type:'hard',kind:'rockoutcrop',x:55,y:50,w:15,h:10,height:3,angle:12}]};await load(p,m);
 const metrics=await p.evaluate(()=>{const F=window.StudioFieldstone,o={id:'test',kind:'rockoutcrop',w:12,h:8,height:2,stone:{burial:35,fragments:8}},a=F.plan(o),b=F.plan(o),slab=F.plan({...o,kind:'buriedslab'})[0];return {deterministic:JSON.stringify(a)===JSON.stringify(b),count:a.length,finite:a.every(c=>c.poly.flat().every(Number.isFinite)&&Number.isFinite(c.offset)&&c.thickness>0),buried:slab.offset-slab.thickness/2+o.height/2<0,exposed:slab.offset+slab.thickness/2+o.height/2>0};});assert(metrics.deterministic&&metrics.finite&&metrics.buried&&metrics.exposed);assert.equal(metrics.count,9);
 await clickWorld(p,55,50);await button(p,'fieldMaterial').selectOption('sandstone');await button(p,'field-burial').fill('55');await button(p,'field-burial').press('Tab');await button(p,'field-fragments').fill('7');await button(p,'field-fragments').press('Tab');const saved=await project(p);assert.deepEqual(saved.objects[1].stone,{material:'sandstone',burial:55,fragments:7});await png(p,'#export','natural-outcrop-plan.png');await enter3(p,0);await waitText(p,'studioStatus',/irregular stone pieces/);await screenshot(p,'natural-outcrop-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);await button(p,'reportOpen').click();assert.match(await button(p,'reportSheet').innerText(),/Layered natural rock outcrop/);return metrics;
});
await run('loose-natural-slab-edging',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'slabbed',type:'bed',points:[[10,10],[42,10],[42,30],[10,30]],edging:{kind:'fieldlimestone',width:1.1,height:.42,piece:1.5}},{id:'stacked',type:'bed',points:[[55,10],[85,10],[85,30],[55,30]],edging:{kind:'stacklimestone',width:1.2,height:.85,piece:1.5}},{id:'naturalwall',type:'hard',kind:'fieldstonewall',x:50,y:50,w:32,h:1.6,height:2.1,angle:12}]};await load(p,m);
 const data=await p.evaluate(()=>{const F=window.StudioFieldstone,E=window.StudioEdging,pts=Array.from({length:120},(_,k)=>[20+10*Math.cos(k*Math.PI/60),20+10*Math.sin(k*Math.PI/60)]),ed=E.defaults('stacklimestone'),a=E.pieces(pts,ed,'test'),b=E.pieces(pts,ed,'test'),slabs=F.slabs({id:'wall',kind:'fieldstonewall',w:20,h:1.2,height:2,stone:{course:.5}});return {deterministic:JSON.stringify(a)===JSON.stringify(b),count:a.length,heights:new Set(a.map(x=>x.h)).size,upper:a.some(x=>x.z>ed.height/2),rows:new Set(slabs.map(x=>x.row)).size,finite:a.every(x=>[x.x,x.y,x.l,x.w,x.h,x.z,x.angle].every(Number.isFinite)),capped:E.pieces(pts,ed,'test',20).length<=20};});assert(data.deterministic&&data.finite&&data.upper&&data.capped);assert(data.count<120&&data.heights>2&&data.rows===4);
 await clickWorld(p,70,20);await button(p,'edgeMaterial').selectOption('stacksandstone');assert.equal((await project(p)).objects[1].edging.kind,'stacksandstone');const saved=await project(p);await png(p,'#export','loose-natural-slab-plan.png');await enter3(p,0);await waitText(p,'studioStatus',/edging parts/);await screenshot(p,'loose-natural-slab-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);return data;
});
await run('rustic-fence-collection',async p=>{
 const kinds=['splitrail','cedarposts','ranchwire','wovenbranch'],m={version:1,width:100,depth:100,objects:kinds.map((kind,j)=>({id:kind,type:'hard',kind,x:50,y:15+j*20,w:32,h:.8,height:4,angle:0}))};await load(p,m);await clickWorld(p,50,15);await button(p,'fenceWildness').selectOption('2');await button(p,'fence-spacing').fill('4');await button(p,'fence-spacing').press('Tab');await button(p,'fence-rails').fill('3');await button(p,'fence-rails').press('Tab');const saved=await project(p);assert.deepEqual(saved.objects[0].fence,{wildness:2,spacing:4,rails:3});const stats=await p.evaluate(m=>m.objects.map(o=>{const F=window.StudioFences,a=F.pieces(o);return {kind:o.kind,parts:a.length,posts:a.filter(v=>v.kind==='post').length,finite:a.every(v=>v.radius>0&&v.pts.flat().every(Number.isFinite)),deterministic:JSON.stringify(a)===JSON.stringify(F.pieces(o))};}),saved);assert(stats.every(a=>a.finite&&a.deterministic&&a.posts>=2));assert.equal(stats[0].posts,9);await button(p,'tab-hard').click();await button(p,'openHardCatalog').click();await button(p,'hardCatalogGroup').selectOption('Fences');assert.equal(await p.locator('#hardCatalogGrid [data-hard-catalog-id]').count(),5);await button(p,'hardCatalogClose').click();await png(p,'#export','rustic-fence-plan.png');await enter3(p,0);await screenshot(p,'rustic-fences-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);return stats;
});
await run('rustic-log-edging-and-habitat',async p=>{
 const m={version:1,width:100,depth:100,objects:[{id:'fallen',type:'hard',kind:'habitatlog',x:20,y:25,w:12,h:1.6,height:1.4,angle:20},{id:'border',type:'hard',kind:'rusticlogborder',x:50,y:50,w:30,h:1,height:.8,angle:0},{id:'bed',type:'bed',points:[[10,65],[35,65],[35,85],[10,85]],edging:{kind:'rusticlog',width:1,height:.8,piece:6}}]};await load(p,m);await clickWorld(p,50,50);await button(p,'logWildness').selectOption('2');await button(p,'logPiece').fill('4');await button(p,'logPiece').press('Tab');assert.deepEqual((await project(p)).objects[1].log,{wildness:2,piece:4});await clickWorld(p,20,75);await button(p,'edgeWildness').selectOption('2');assert.equal((await project(p)).objects[2].edging.wildness,2);const saved=await project(p);await png(p,'#export','rustic-log-plan.png');await enter3(p,0);await waitText(p,'studioStatus',/edging parts/);await screenshot(p,'rustic-log-3d');await button(p,'studioClose').click();await p.reload();assert.deepEqual((await project(p)).objects,saved.objects);return {rusticObjects:3};
});
for(const [name,n,w,h] of [['one-acre',1000,220,198],['restoration',5000,660,660],...(process.env.QA_STRESS==='1'?[['stress',19990,1320,660]]:[])]){
  await run(name,async p=>{await load(p,fixture(name,n,w,h));const metrics=await enter3(p,n);await button(p,'studioMode').selectOption('walk');await waitText(p,'studioStatus',/Walkthrough/);metrics.walk=await ready3(p,n);await screenshot(p,name+'-walk');await button(p,'studioMode').selectOption('orbit');await waitText(p,'studioStatus',/Three\.js/);metrics.orbit=await ready3(p,n);await screenshot(p,name+'-orbit');return metrics;});
}
}finally{await browser.close();await writeFile(resolve(dir,'results.json'),JSON.stringify(results,null,2));}
if(results.some(r=>!r.passed))process.exitCode=1;

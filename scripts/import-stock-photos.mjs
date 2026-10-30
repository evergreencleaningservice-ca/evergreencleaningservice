/** Prepare licensed stock replacements without publishing to the shared image host.
 * node scripts/import-stock-photos.mjs --sources /private/web-sources [--apply]
 * Sources must be licensed JPEGs named <stockId>.jpg. Originals stay private.
 * Only manifest entries marked licensed are processed. Old dimensions and names
 * are retained so all responsive, thumbnail and social references stay valid.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const arg=process.argv.indexOf('--sources');
if(arg<0||!process.argv[arg+1])throw new Error('--sources must name the private licensed source directory');
const sources=path.resolve(process.argv[arg+1]);
const apply=process.argv.includes('--apply');
const manifest=JSON.parse(await fs.readFile('docs/stock-photos/manifest.json','utf8'));
const providerArg=process.argv.indexOf('--provider');
const provider=providerArg<0?null:process.argv[providerArg+1];
if(providerArg>=0&&!provider)throw new Error('--provider requires a provider name');
const photos=manifest.photos.filter(p=>p.licensed&&(!provider||p.provider===provider));
if(!photos.length)throw new Error('No licensed photos match the requested provider');
if(new Set(manifest.photos.map(p=>p.stockId)).size!==manifest.photos.length)throw new Error('Stock selections must remain distinct');
const imageDir=path.resolve('public/images');
const names=await fs.readdir(imageDir);
const prepared=path.resolve('.stock-photo-prepared');
await fs.mkdir(prepared,{recursive:true});
const stats=[];

for(const photo of photos){
 const input=path.join(sources,photo.stockId+'.jpg');
 const sourceMeta=await sharp(input).metadata();
 if(!sourceMeta.width||!sourceMeta.height)throw new Error(`Unreadable source ${photo.stockId}`);
 // The pipeline auto-orients (.rotate()) before .extract(), so the crop is in
 // the oriented frame; EXIF orientations 5-8 swap the stored width and height.
 const turned=(sourceMeta.orientation??1)>=5;
 const srcW=turned?sourceMeta.height:sourceMeta.width,srcH=turned?sourceMeta.width:sourceMeta.height;
 const [x,y,w,h]=photo.crop;
 const left=Math.round(x*srcW),top=Math.round(y*srcH);
 const crop={left,top,width:Math.min(Math.round(w*srcW),srcW-left),height:Math.min(Math.round(h*srcH),srcH-top)};
 const stem=photo.asset.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp(`^${stem}(?:-(?:[0-9]+|[0-9]+x[0-9]+|mobile-[0-9]+x[0-9]+|og))?\\.(jpg|jpeg|webp|avif|png)$`,'i');
 const targets=names.filter(n=>pattern.test(n));
 if(!targets.length)throw new Error(`No existing image targets for ${photo.asset}`);
 const groups=new Map();
 for(const filename of targets){
  const meta=await sharp(path.join(imageDir,filename)).metadata();
  if(!meta.width||!meta.height)throw new Error(`Missing dimensions: ${filename}`);
  const pipeline=sharp(input).rotate().extract(crop).resize(meta.width,meta.height,{fit:'cover',position:'centre'});
  const ext=path.extname(filename).slice(1).toLowerCase();
  let output;
  if(ext==='jpg'||ext==='jpeg')output=await pipeline.jpeg({quality:82,mozjpeg:true}).toBuffer();
  else if(ext==='webp')output=await pipeline.webp({quality:74}).toBuffer();
  else if(ext==='avif')output=await pipeline.avif({quality:48,effort:4}).toBuffer();
  else output=await pipeline.png().toBuffer();
  await fs.writeFile(path.join(prepared,filename),output);
  const key=filename.replace(/\.(jpg|jpeg|avif|webp|png)$/i,'');
  if(!groups.has(key))groups.set(key,{});
  groups.get(key)[ext]={filename,bytes:output.length,width:meta.width,height:meta.height};
  stats.push({asset:photo.asset,stockId:photo.stockId,filename,width:meta.width,height:meta.height,bytes:output.length});
 }
 // Keep the repository's modern-format contract: each modern sibling is
 // smaller than its JPEG counterpart, never merely a different extension.
 for(const group of groups.values()){
  const jpg=group.jpg??group.jpeg;
  if(!jpg)continue;
  for(const ext of ['webp','avif']){
   const target=group[ext];if(!target||target.bytes<jpg.bytes)continue;
   let output;
   for(const quality of (ext==='webp'?[64,54,44]:[40,32,24])){
    const pipeline=sharp(input).rotate().extract(crop).resize(target.width,target.height,{fit:'cover',position:'centre'});
    output=ext==='webp'?await pipeline.webp({quality}).toBuffer():await pipeline.avif({quality,effort:4}).toBuffer();
    if(output.length<jpg.bytes)break;
   }
   if(output.length>=jpg.bytes)throw new Error(`Modern-format size gate failed: ${target.filename}`);
   await fs.writeFile(path.join(prepared,target.filename),output);
   stats.find(s=>s.filename===target.filename).bytes=output.length;
  }
 }
}

// Validate the entire generated set before touching the working website.
for(const item of stats){
 const meta=await sharp(path.join(prepared,item.filename)).metadata();
 if(meta.width!==item.width||meta.height!==item.height)throw new Error(`Dimension mismatch: ${item.filename}`);
}
if(apply)for(const item of stats)await fs.copyFile(path.join(prepared,item.filename),path.join(imageDir,item.filename));
await fs.writeFile('docs/stock-photos/prepared.json',JSON.stringify({licensedPhotos:manifest.photos.filter(p=>p.licensed).length,pendingPhotos:manifest.photos.filter(p=>!p.licensed).length,batchPhotos:photos.length,provider,appliedToWorkingTree:apply,files:stats},null,2)+'\n');
console.log(JSON.stringify({photos:photos.length,files:stats.length,pending:manifest.photos.filter(p=>!p.licensed).length,applied:apply,bytes:stats.reduce((n,s)=>n+s.bytes,0)}));

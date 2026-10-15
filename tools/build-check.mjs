import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadData} from './data.mjs';
await import('./build.mjs');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {fusions,config}=await loadData(root),dist=path.join(root,'dist');
const walk=async dir=>(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();
const files=await walk(dist);let pages=0,buttons=0;
for(const file of files){
 assert.ok((await fs.stat(file)).size<=25*1024*1024,'Cloudflare Pages asset exceeds 25 MiB');
 if(!file.endsWith('.html'))continue;pages++;
 const html=await fs.readFile(file,'utf8');assert.ok(html.includes('<title>')&&html.includes('name="description"'));
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|#|data:|mailto:)/.test(url))continue;
  const target=url.startsWith('/')?path.join(dist,url):path.resolve(path.dirname(file),url.split(/[?#]/)[0]);assert.ok(target===dist||target.startsWith(dist+path.sep),url);await fs.access(target);
 }
 for(const [,url] of html.matchAll(/<a[^>]*href="([^"]*)"[^>]*data-config-link="DOWNLOAD_URL"/g)){buttons++;if(config.DOWNLOAD_URL)assert.equal(url,config.DOWNLOAD_URL);}
}
assert.equal(pages,fusions.length+11);
const home=await fs.readFile(path.join(dist,'index.html'),'utf8');
assert.equal((home.match(/class="fusion-card"/g)||[]).length,fusions.filter(f=>f.featured).length);
const catalogue=await fs.readFile(path.join(dist,'fusions/index.html'),'utf8');
assert.equal((catalogue.match(/data-fusion-card /g)||[]).length,fusions.length);
const sitemap=await fs.readFile(path.join(dist,'sitemap.xml'),'utf8');
for(const f of fusions){await fs.access(path.join(dist,'fusions',f.slug,'index.html'));assert.ok(sitemap.includes(`/fusions/${f.slug}/`));}
assert.ok(!files.some(f=>/\.(exe|fzp)$/.test(f)),'Installer binaries do not belong in the website');
console.log(`CHECK PASS: ${pages} pages, ${fusions.length} Fusions, ${buttons} Windows buttons; assets, links, SEO and release metadata valid. Nothing published.`);

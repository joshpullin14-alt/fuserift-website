import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {Miniflare} from 'miniflare';
import {build} from 'esbuild';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function runtime({directory=path.join(root,'.local-community'),secret,port}={}){
 await fs.mkdir(directory,{recursive:true});
 if(!secret){const file=path.join(directory,'local-secret');try{secret=await fs.readFile(file,'utf8');}catch{secret=randomBytes(32).toString('hex');await fs.writeFile(file,secret,{flag:'wx'});}}
 const bundle=await build({entryPoints:[path.join(root,'worker/community.js')],bundle:true,format:'esm',write:false,platform:'browser',target:'es2022'});
 const mf=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-07-30',d1Databases:{DB:'local-community'},d1Persist:path.join(directory,'d1'),bindings:{ABUSE_SECRET:secret,LOCAL_PREVIEW:'true'},host:'127.0.0.1',...(port?{port}:{})});
 const db=await mf.getD1Database('DB');
 const schema=await fs.readFile(path.join(root,'migrations/0001-community.sql'),'utf8');
 for(const sql of schema.replace(/^\uFEFF/,'').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
 return {mf,db};
}

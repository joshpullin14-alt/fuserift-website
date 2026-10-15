import catalogue from '../data/fusions.json';
const ids=new Set(catalogue.map(f=>f.id));
const enc=new TextEncoder();
const json=(body,status=200,extra={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
async function hmac(secret,text){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(text)))].map(b=>b.toString(16).padStart(2,'0')).join('');}
function equal(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;}
async function visitor(req,secret){const raw=req.headers.get('Cookie')?.match(/(?:^|;\s*)fr_vote=([^;]+)/)?.[1]||'';const [id,sig]=raw.split('.');if(/^[a-f0-9-]{36}$/.test(id||'')&&sig&&equal(sig,await hmac(secret,'cookie:'+id)))return id;return null;}
async function limit(db,key,max,ttl,now){const row=await db.prepare('INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=limits.count+1 RETURNING count').bind(key,now+ttl).first();if(row.count>max)fail(429,'Too many requests. Please try again later.');}
async function body(req){if(!req.headers.get('Content-Type')?.startsWith('application/json'))fail(415,'Please send the website form.');const reader=req.body?.getReader();if(!reader)fail(400,'Missing form data.');let total=0,parts=[];for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>90000){await reader.cancel();fail(413,'The report is too large. Keep the log below 64 KB.');}parts.push(value);}const all=new Uint8Array(total);let offset=0;for(const p of parts){all.set(p,offset);offset+=p.length;}try{const b=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(all));if(!b||Array.isArray(b)||typeof b!=='object')throw Error();return b;}catch{fail(400,'Please check the form and try again.');}}
function field(b,key,max,optional=false){const v=b[key];if(optional&&(v===undefined||v===''))return '';if(typeof v!=='string'||!v.trim()||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))fail(400,'Please check '+key+' and try again.');return v.trim();}
async function aggregates(db,v){const rows=await db.prepare('SELECT fusion,AVG(stars) AS average,COUNT(*) AS count FROM ratings GROUP BY fusion').all();const mine=v?await db.prepare('SELECT fusion,stars FROM ratings WHERE visitor=?').bind(v).all():{results:[]};return {ratings:catalogue.map(f=>({fusion:f.id,average:rows.results.find(r=>r.fusion===f.id)?.average??null,count:rows.results.find(r=>r.fusion===f.id)?.count??0,mine:mine.results.find(r=>r.fusion===f.id)?.stars??null}))};}
export async function cleanup(env,now=Math.floor(Date.now()/1000)){await env.DB.batch([env.DB.prepare('DELETE FROM limits WHERE expires<?').bind(now),env.DB.prepare("DELETE FROM submissions WHERE (kind='bugs' AND created<?) OR (kind='suggestions' AND created<?)").bind(now-90*86400,now-365*86400)]);}
export default {
 async fetch(req,env){try{
  const u=new URL(req.url),kind=u.pathname.replace(/^\/api\//,'');
  if(!['ratings','bugs','suggestions'].includes(kind))return json({error:'Not found.'},404);
  if(!env.DB||!env.ABUSE_SECRET||env.ABUSE_SECRET.length<32)return json({error:'Community features are temporarily unavailable. Please email support@fuserift.co.uk.'},503);
  const now=Math.floor(Date.now()/1000),day=Math.floor(now/86400);
  const ip=req.headers.get('CF-Connecting-IP')||(env.LOCAL_PREVIEW==='true'?'local-preview':null);
  if(!ip)return json({error:'Unable to verify this connection. Please try again.'},503);
  const ipKey=await hmac(env.ABUSE_SECRET,'ip:'+day+':'+ip);
  let v=await visitor(req,env.ABUSE_SECRET);
  if(req.method==='GET'&&kind==='ratings'){
   await limit(env.DB,'read:'+Math.floor(now/60)+':'+ipKey,120,120,now);
   return json(await aggregates(env.DB,v?await hmac(env.ABUSE_SECRET,'vote:'+v):null));
  }
  if(req.method!=='POST')return json({error:'Method not allowed.'},405,{Allow:kind==='ratings'?'GET, POST':'POST'});
  const origin=req.headers.get('Origin');
  const allowed=['https://fuserift.co.uk','https://www.fuserift.co.uk'];
  if(env.LOCAL_PREVIEW==='true')allowed.push('http://127.0.0.1:4174');
  if(!allowed.includes(origin)||req.headers.get('Sec-Fetch-Site')==='cross-site')fail(403,'Please submit from the FuseRift website.');
  await limit(env.DB,kind+':'+Math.floor(now/3600)+':'+ipKey,{ratings:20,bugs:5,suggestions:10}[kind],7200,now);
  const b=await body(req);if(b.website)fail(400,'Unable to accept this submission.');
  if(kind==='ratings'){
   if(!ids.has(b.fusion)||!Number.isInteger(b.stars)||b.stars<1||b.stars>5)fail(400,'Choose a Fusion and 1–5 stars.');
   v ||= crypto.randomUUID();const vk=await hmac(env.ABUSE_SECRET,'vote:'+v);
   await limit(env.DB,'visitor:'+kind+':'+Math.floor(now/3600)+':'+vk,20,7200,now);
   await env.DB.prepare('INSERT INTO ratings(fusion,visitor,stars,updated) VALUES(?,?,?,?) ON CONFLICT(fusion,visitor) DO UPDATE SET stars=excluded.stars,updated=excluded.updated').bind(b.fusion,vk,b.stars,now).run();
   const cookie='fr_vote='+v+'.'+await hmac(env.ABUSE_SECRET,'cookie:'+v)+'; Path=/api/; HttpOnly; SameSite=Lax; Max-Age=15552000'+(env.LOCAL_PREVIEW==='true'?'':'; Secure');
   return json({...await aggregates(env.DB,vk),message:'Your rating is saved.'},200,{'Set-Cookie':cookie});
  }
  let payload;
  if(kind==='bugs'){
   if(!ids.has(b.fusion)&&b.fusion!=='launcher')fail(400,'Choose a Fusion.');
   payload={fusion:b.fusion,version:field(b,'version',60),windows:field(b,'windows',100),happened:field(b,'happened',4000),expected:field(b,'expected',4000),steps:field(b,'steps',4000),email:field(b,'email',254,true),log:field(b,'log',65536,true)};
   if(payload.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email))fail(400,'Check your email address.');
   if(enc.encode(payload.log).length>65536)fail(413,'Keep the text log below 64 KB.');
  }else payload={gameA:field(b,'gameA',120),gameB:field(b,'gameB',120)};
  const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO submissions(id,kind,body,created) VALUES(?,?,?,?)').bind(id,kind,JSON.stringify(payload),now).run();
  return json({id,message:kind==='bugs'?'Report saved. Keep this reference for support: '+id:'Thanks — your suggestion has been saved for private review.'},201);
 }catch(e){return json({error:e.status?e.message:'Unable to save right now. Please try again, or email support@fuserift.co.uk.'},e.status||503,e.status===429?{'Retry-After':'3600'}:{});}},
 async scheduled(event,env,ctx){ctx.waitUntil(cleanup(env));}
};

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {runtime,root} from './community-runtime.mjs';
const {mf,db}=await runtime();
const clean=async()=>db.batch([db.prepare('DELETE FROM limits WHERE expires<?').bind(Math.floor(Date.now()/1000)),db.prepare("DELETE FROM submissions WHERE (kind='bugs' AND created<?) OR (kind='suggestions' AND created<?)").bind(Math.floor(Date.now()/1000)-90*86400,Math.floor(Date.now()/1000)-365*86400)]);
const timer=setInterval(()=>clean().catch(()=>{}),3600000);timer.unref();await clean();
const dist=path.join(root,'dist');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.pem':'text/plain'};
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://127.0.0.1:4174');
 if(url.pathname.startsWith('/api/')){
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>90000){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Report too large.'}));return;}chunks.push(chunk);}
  const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);
  // Never trust a client-supplied Cloudflare IP in the loopback preview server.
  headers.set('CF-Connecting-IP',req.socket.remoteAddress||'127.0.0.1');
  const response=await mf.dispatchFetch(url.href,{method:req.method,headers,body:chunks.length?Buffer.concat(chunks):undefined});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let relative=decodeURIComponent(url.pathname).replace(/^\/+/,''),file=path.resolve(dist,relative);
 if(file!==dist&&!file.startsWith(dist+path.sep)){res.writeHead(403);res.end();return;}
 let status=200;try{const stat=await fs.stat(file);if(stat.isDirectory()){if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}file=path.join(file,'index.html');}}catch{status=404;file=path.join(dist,'404.html');}
 const data=await fs.readFile(file);
 res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(500);res.end('Preview unavailable.');}});
server.listen(4174,'127.0.0.1',()=>console.log('Unpublished preview: http://127.0.0.1:4174/ — local Cloudflare D1 storage.'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{server.close();await mf.dispose();process.exit();});
